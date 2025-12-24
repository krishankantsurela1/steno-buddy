import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft, Copy, Play, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CORRECT_PASSWORD = '68194934';

const StenoMarker = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [dictationText, setDictationText] = useState('');
  const [wpm, setWpm] = useState<number>(80);
  const [fontType, setFontType] = useState<'system' | 'kruti'>('system');
  const [markedText, setMarkedText] = useState<React.ReactNode[]>([]);
  const [rawMarkedText, setRawMarkedText] = useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const processText = () => {
    if (!dictationText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter dictation matter first.",
        variant: "destructive"
      });
      return;
    }

    if (wpm <= 0) {
      toast({
        title: "Invalid WPM",
        description: "Please enter a valid WPM value.",
        variant: "destructive"
      });
      return;
    }

    const interval = Math.round(wpm / 4);
    
    // Split by '*' to get sections (reset word count for each section)
    const sections = dictationText.split('*');
    const resultElements: React.ReactNode[] = [];
    let resultText = '';
    let globalKey = 0;

    sections.forEach((section, sectionIndex) => {
      // Add '*' separator between sections
      if (sectionIndex > 0) {
        resultElements.push(
          <span key={globalKey++} className="text-purple-600 font-bold">*</span>
        );
        resultText += '*';
      }

      // Split section by newlines to preserve paragraph structure
      const paragraphs = section.split('\n');
      let wordCount = 0;
      let minuteCount = 0;

      paragraphs.forEach((paragraph, paraIndex) => {
        // Add line break before paragraph (except first)
        if (paraIndex > 0) {
          resultElements.push(<br key={globalKey++} />);
          resultText += '\n';
        }

        // Get words from paragraph, preserving structure
        const words = paragraph.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length === 0) {
          // Empty paragraph - just continue (the line break is already added)
          return;
        }

        words.forEach((word, wordIndex) => {
          wordCount++;

          // Add space before word (except first word in paragraph)
          if (wordIndex > 0) {
            resultElements.push(<span key={globalKey++}> </span>);
            resultText += ' ';
          }

          // Add the word
          resultElements.push(<span key={globalKey++}>{word}</span>);
          resultText += word;

          // Check for full minute marker (every WPM words)
          if (wordCount % wpm === 0) {
            minuteCount++;
            const minuteMarker = `@@${minuteCount}@@`;
            resultElements.push(
              <span key={globalKey++} className="bg-green-400 text-green-900 font-bold px-1 mx-1 rounded">
                {minuteMarker}
              </span>
            );
            resultText += ` ${minuteMarker}`;
          }
          // Check for interval marker (every interval words, but not if it's also a minute marker)
          else if (wordCount % interval === 0) {
            resultElements.push(
              <span key={globalKey++} className="bg-yellow-300 text-yellow-900 px-1 mx-1 rounded">
                @@
              </span>
            );
            resultText += ' @@';
          }
        });
      });
    });

    setMarkedText(resultElements);
    setRawMarkedText(resultText);

    toast({
      title: "Text Processed",
      description: `Marked text with interval markers.`
    });
  };

  const copyToClipboard = async () => {
    if (!rawMarkedText) {
      toast({
        title: "No Result",
        description: "Please process the text first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create rich HTML for clipboard that preserves paragraph breaks
      const htmlContent = generateRichHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([rawMarkedText], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob
        })
      ]);

      toast({
        title: "Copied!",
        description: "Marked text copied to clipboard with formatting preserved.",
        duration: 2000
      });
    } catch (error) {
      // Fallback for browsers that don't support ClipboardItem
      await navigator.clipboard.writeText(rawMarkedText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard (plain text).",
        duration: 2000
      });
    }
  };

  const generateRichHTML = (): string => {
    const interval = Math.round(wpm / 4);
    const sections = dictationText.split('*');
    let html = `<div style="font-family: ${fontType === 'kruti' ? "'Kruti Dev 010', " : ''}Arial, sans-serif; font-size: 14pt; line-height: 1.8; white-space: pre-wrap;">`;

    sections.forEach((section, sectionIndex) => {
      if (sectionIndex > 0) {
        html += '<span style="color: purple; font-weight: bold;">*</span>';
      }

      // Split by newlines to preserve paragraph structure
      const paragraphs = section.split('\n');
      let wordCount = 0;
      let minuteCount = 0;

      paragraphs.forEach((paragraph, paraIndex) => {
        // Add line break for paragraph separation
        if (paraIndex > 0) {
          html += '\n';
        }

        const words = paragraph.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length === 0) {
          return;
        }

        words.forEach((word, wordIndex) => {
          wordCount++;

          if (wordIndex > 0) {
            html += ' ';
          }

          html += `<span>${word}</span>`;

          if (wordCount % wpm === 0) {
            minuteCount++;
            html += ` <span style="background-color: #4ade80; color: #14532d; font-weight: bold; padding: 2px 4px; border-radius: 3px;">@@${minuteCount}@@</span>`;
          } else if (wordCount % interval === 0) {
            html += ` <span style="background-color: #fde047; color: #713f12; padding: 2px 4px; border-radius: 3px;">@@</span>`;
          }
        });
      });
    });

    html += '</div>';
    return html;
  };

  const fontClass = fontType === 'kruti' ? 'font-kruti-dev text-xl' : '';

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevation-medium">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Steno Marker Access
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Enter password to access the Steno Marker tool
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoComplete="off"
                />
              </div>
              
              {loginError && (
                <p className="text-sm text-destructive font-medium">{loginError}</p>
              )}
              
              <Button type="submit" className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                Access Steno Marker
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  ← Back to Evaluator
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-card">
        <div className="text-center text-xs text-muted-foreground py-1 bg-muted/30 border-b border-border">
          Developed by <span className="font-semibold">[Krishan Kant Surela]</span>
        </div>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Evaluator</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Steno Marker
              </h1>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="wpm" className="text-sm font-medium mb-2 block">
                Words Per Minute (WPM)
              </Label>
              <Input
                id="wpm"
                type="number"
                value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value) || 0)}
                className="w-full"
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="font" className="text-sm font-medium mb-2 block">
                Font Display
              </Label>
              <Select value={fontType} onValueChange={(v) => setFontType(v as 'system' | 'kruti')}>
                <SelectTrigger id="font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Font</SelectItem>
                  <SelectItem value="kruti">Kruti Dev 010</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={processText} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Process
              </Button>
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Input and Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <Label className="text-lg font-semibold text-foreground mb-3 block">
              Dictation Matter
            </Label>
            <Textarea
              placeholder="Paste your dictation text here... Use * to separate different matters. All paragraph breaks will be preserved."
              value={dictationText}
              onChange={(e) => setDictationText(e.target.value)}
              className={`min-h-[400px] resize-none ${fontClass}`}
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Use <span className="font-mono bg-muted px-1 rounded">*</span> to separate different dictation sections (word count resets). All paragraph breaks are preserved.
            </p>
          </div>

          {/* Output Area */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <Label className="text-lg font-semibold text-foreground mb-3 block">
              Marked Output
            </Label>
            <div 
              className={`min-h-[400px] p-4 bg-background border border-border rounded-lg overflow-auto leading-relaxed ${fontClass}`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {markedText.length > 0 ? (
                <>{markedText}</>
              ) : (
                <p className="text-muted-foreground italic">
                  Processed text will appear here...
                </p>
              )}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="bg-yellow-300 text-yellow-900 px-1 rounded">@@</span>
                = 15-second interval
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-green-400 text-green-900 font-bold px-1 rounded">@@1@@</span>
                = Minute marker
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StenoMarker;
