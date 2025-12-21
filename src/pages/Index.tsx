import { useState, useEffect } from 'react';
import { Play, RotateCcw, Printer, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import TextPanel from '@/components/TextPanel';
import ExamHeader from '@/components/ExamHeader';
import ScoringDashboard from '@/components/ScoringDashboard';
import ResultDisplay from '@/components/ResultDisplay';
import { analyzeText, type DiffResult, type AnalysisStats } from '@/utils/diffAlgorithm';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Keyboard } from 'lucide-react';

const Index = () => {
  const [masterText, setMasterText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [results, setResults] = useState<DiffResult[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [useKrutiDev, setUseKrutiDev] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [examDate, setExamDate] = useState('');
  const { toast } = useToast();

  // Auto-fill date on mount
  useEffect(() => {
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);
    setExamDate(localDateTime);
  }, []);

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
      description: `Found ${analysis.stats.errors} error(s) with ${analysis.stats.accuracy}% accuracy.`,
    });
  };

  const handleReset = () => {
    setMasterText('');
    setTypedText('');
    setResults([]);
    setStats(null);
    toast({
      title: 'Reset Complete',
      description: 'All fields have been cleared.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

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

        {/* Text Panels */}
        <div className="grid md:grid-cols-2 gap-6 no-print">
          <TextPanel
            label="Master Text"
            placeholder="Enter the original/master text here... (Hindi and English supported)"
            value={masterText}
            onChange={setMasterText}
            icon={<BookOpen className="w-5 h-5 text-primary" />}
          />
          <TextPanel
            label="Student Typed Text"
            placeholder="Enter the student's typed text here..."
            value={typedText}
            onChange={setTypedText}
            icon={<Keyboard className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center no-print">
          <Button size="lg" onClick={handleAnalyze} className="min-w-[180px]">
            <Play className="w-5 h-5" />
            Analyze
          </Button>
          <Button size="lg" variant="outline" onClick={handlePrint} className="min-w-[180px]" disabled={results.length === 0}>
            <Printer className="w-5 h-5" />
            Print
          </Button>
          <Button size="lg" variant="outline" onClick={handleReset} className="min-w-[180px]">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {/* Kruti Dev Toggle */}
        {results.length > 0 && (
          <div className="flex items-center justify-center gap-3 no-print">
            <Type className="w-5 h-5 text-primary" />
            <Label htmlFor="kruti-toggle" className="font-medium cursor-pointer">
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
