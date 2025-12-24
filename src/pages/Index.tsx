import { useState, useEffect } from 'react';
import { Play, RotateCcw, Printer, Type, Copy, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Header from '@/components/Header';
import TextPanel from '@/components/TextPanel';
import ExamHeader from '@/components/ExamHeader';
import ScoringDashboard from '@/components/ScoringDashboard';
import ResultDisplay from '@/components/ResultDisplay';
import LoginScreen from '@/components/LoginScreen';
import { analyzeText, type DiffResult, type AnalysisStats, setKrutidevComparisonEnabled, isKrutidevComparisonEnabled } from '@/utils/diffAlgorithm';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Keyboard } from 'lucide-react';

const MASTER_PASSWORD = '68194934';

// Format date to IST: DD/MM/YYYY | HH:MM AM/PM
const formatISTDateTime = (): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(new Date());
  
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  
  const day = get('day');
  const month = get('month');
  const year = get('year');
  const hour = get('hour');
  const minute = get('minute');
  const dayPeriod = get('dayPeriod').toUpperCase();
  
  return `${day}/${month}/${year} | ${hour}:${minute} ${dayPeriod}`;
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [masterText, setMasterText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [results, setResults] = useState<DiffResult[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [useKrutiDev, setUseKrutiDev] = useState(false);
  const [useKrutiDevInput, setUseKrutiDevInput] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [examDate, setExamDate] = useState('');
  const [smartComparisonEnabled, setSmartComparisonEnabled] = useState(true);
  const [settingsPassword, setSettingsPassword] = useState('');
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Auto-fill date on mount with IST
  useEffect(() => {
    setExamDate(formatISTDateTime());
  }, []);

  // Sync smart comparison state with the algorithm
  useEffect(() => {
    setKrutidevComparisonEnabled(smartComparisonEnabled);
  }, [smartComparisonEnabled]);

  const handleAnalyze = () => {
    if (!masterText.trim()) {
      toast({
        title: 'Master Text Required',
        description: 'Please enter the master text to compare against.',
        variant: 'destructive',
      });
      return;
    }

    if (!typedText.trim()) {
      toast({
        title: 'Typed Text Required',
        description: 'Please enter the student typed text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    const analysis = analyzeText(masterText, typedText);
    setResults(analysis.results);
    setStats(analysis.stats);

    toast({
      title: 'Analysis Complete',
      description: `Score: ${analysis.stats.marks}/100 (${analysis.stats.fullMistakes} full + ${analysis.stats.halfMistakes} half mistakes)`,
    });
  };

  const handleReset = () => {
    setMasterText('');
    setTypedText('');
    setResults([]);
    setStats(null);
    setExamDate(formatISTDateTime());
    toast({
      title: 'Reset Complete',
      description: 'All fields have been cleared.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generateRichHTML = (): string => {
    const fontFamily = useKrutiDev ? "'Kruti Dev 010', Arial, sans-serif" : "Arial, sans-serif";
    const arialStyle = "font-family: Arial, sans-serif;";
    
    let html = `<div style="font-family: ${fontFamily}; font-size: 14pt; line-height: 1.6;">`;
    
    results.forEach((result) => {
      switch (result.type) {
        case 'correct':
          html += `<span style="color: black;">${result.typed}</span><span style="${arialStyle}"> </span>`;
          break;
        case 'error':
          html += `<span style="color: #dc2626; font-style: italic; text-decoration: underline; text-decoration-style: dotted;">${result.typed}</span>`;
          html += `<span style="${arialStyle}"> [</span>`;
          html += `<span style="color: #16a34a; font-weight: bold;">${result.correct}</span>`;
          html += `<span style="${arialStyle}">] </span>`;
          break;
        case 'half-error':
          html += `<span style="color: #ca8a04; font-style: italic; text-decoration: underline; text-decoration-style: wavy;">${result.typed || '∅'}</span>`;
          html += `<span style="${arialStyle}"> [</span>`;
          html += `<span style="color: #16a34a; font-weight: bold;">${result.correct || '∅'}</span>`;
          html += `<span style="${arialStyle}">] </span>`;
          break;
        case 'missing':
          html += `<span style="${arialStyle}">[</span>`;
          html += `<span style="color: #16a34a; font-weight: bold;">${result.correct}</span>`;
          html += `<span style="${arialStyle}">] </span>`;
          break;
        case 'extra':
          html += `<span style="color: #dc2626; text-decoration: line-through;">${result.typed}</span><span style="${arialStyle}"> </span>`;
          break;
      }
    });
    
    html += '</div>';
    return html;
  };

  const handleCopyResult = async () => {
    if (results.length === 0) return;
    
    try {
      const htmlContent = generateRichHTML();
      const plainText = document.getElementById('result-text')?.innerText || '';
      
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      
      toast({
        title: 'Copied!',
        description: 'Rich text copied. Paste into MS Word to preserve formatting.',
      });
    } catch (error) {
      // Fallback to plain text
      const text = document.getElementById('result-text')?.innerText || '';
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: 'Copied!',
          description: 'Plain text copied (rich copy not supported in this browser).',
        });
      }).catch(() => {
        toast({
          title: 'Copy Failed',
          description: 'Could not copy to clipboard.',
          variant: 'destructive',
        });
      });
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Exam Header */}
        <ExamHeader
          studentName={studentName}
          testNumber={testNumber}
          examDate={examDate}
          onStudentNameChange={setStudentName}
          onTestNumberChange={setTestNumber}
          onExamDateChange={setExamDate}
        />

        {/* Input Font Toggle */}
        <div className="flex items-center justify-center gap-3 no-print">
          <Type className="w-5 h-5 text-primary" />
          <Label htmlFor="kruti-input-toggle" className="font-medium cursor-pointer bracket-arial">
            Kruti Dev Input Mode
          </Label>
          <Switch
            id="kruti-input-toggle"
            checked={useKrutiDevInput}
            onCheckedChange={setUseKrutiDevInput}
          />
        </div>

        {/* Text Panels */}
        <div className="grid md:grid-cols-2 gap-6 no-print">
          <TextPanel
            label="Master Text"
            placeholder="Enter the original/master text here... (Hindi and English supported)"
            value={masterText}
            onChange={setMasterText}
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            useKrutiDev={useKrutiDevInput}
          />
          <TextPanel
            label="Student Typed Text"
            placeholder="Enter the student's typed text here..."
            value={typedText}
            onChange={setTypedText}
            icon={<Keyboard className="w-5 h-5 text-primary" />}
            useKrutiDev={useKrutiDevInput}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center no-print">
          <Button size="lg" onClick={handleAnalyze} className="min-w-[180px]">
            <Play className="w-5 h-5" />
            Analyze
          </Button>
          <Button size="lg" variant="outline" onClick={handleCopyResult} className="min-w-[180px]" disabled={results.length === 0}>
            <Copy className="w-5 h-5" />
            Copy Result
          </Button>
          <Button size="lg" variant="outline" onClick={handlePrint} className="min-w-[180px]" disabled={results.length === 0}>
            <Printer className="w-5 h-5" />
            Print
          </Button>
          <Button size="lg" variant="outline" onClick={handleReset} className="min-w-[180px]">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
          
          {/* Smart Comparison Settings */}
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="min-w-[180px]">
                <Settings className="w-5 h-5" />
                Smart Comparison
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Krutidev Smart Comparison Settings
                </DialogTitle>
                <DialogDescription>
                  Advanced settings for Hindi Krutidev font comparison. Password protected.
                </DialogDescription>
              </DialogHeader>
              
              {!isSettingsUnlocked ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings-password">Master Password</Label>
                    <Input
                      id="settings-password"
                      type="password"
                      placeholder="Enter master password..."
                      value={settingsPassword}
                      onChange={(e) => setSettingsPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && settingsPassword === MASTER_PASSWORD) {
                          setIsSettingsUnlocked(true);
                          setSettingsPassword('');
                        }
                      }}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      if (settingsPassword === MASTER_PASSWORD) {
                        setIsSettingsUnlocked(true);
                        setSettingsPassword('');
                      } else {
                        toast({
                          title: 'Invalid Password',
                          description: 'Please enter the correct master password.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    Unlock Settings
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Smart Comparison Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                    <div className="space-y-1">
                      <Label htmlFor="smart-comparison" className="font-semibold">
                        Smart Visual Comparison
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enable intelligent matching for Krutidev variations
                      </p>
                    </div>
                    <Switch
                      id="smart-comparison"
                      checked={smartComparisonEnabled}
                      onCheckedChange={setSmartComparisonEnabled}
                    />
                  </div>
                  
                  {/* Feature List */}
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold text-primary">When enabled, the following are treated as CORRECT:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span><strong>Alt-Code Bypass:</strong> क्त, द्द, त्त, द्ध, द्य, द्व, क्र, त्र, श्र, प्र etc. match their split forms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span><strong>Nasal Sounds:</strong> सम्बन्ध = संबंध, बन्दूक = बंदूक</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span><strong>Chandra-bindu:</strong> पहुँच = पहुंच, माँ = मां</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span><strong>Nukta Neutrality:</strong> Ignores ़ in all comparisons</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className={`p-3 rounded-lg text-center font-medium ${smartComparisonEnabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {smartComparisonEnabled 
                      ? '✓ Smart Comparison is ACTIVE' 
                      : '⚠ Smart Comparison is DISABLED'}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Kruti Dev Toggle */}
        {results.length > 0 && (
          <div className="flex items-center justify-center gap-3 no-print">
            <Type className="w-5 h-5 text-primary" />
            <Label htmlFor="kruti-toggle" className="font-medium cursor-pointer bracket-arial">
              Switch to Kruti Dev View
            </Label>
            <Switch
              id="kruti-toggle"
              checked={useKrutiDev}
              onCheckedChange={setUseKrutiDev}
            />
          </div>
        )}

        {/* Scoring Dashboard */}
        <ScoringDashboard stats={stats} isVisible={results.length > 0} />

        {/* Results */}
        <ResultDisplay results={results} useKrutiDev={useKrutiDev} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border no-print">
        <p>Steno Exam Evaluator • Supports Hindi (हिंदी) and English</p>
      </footer>
    </div>
  );
};

export default Index;
