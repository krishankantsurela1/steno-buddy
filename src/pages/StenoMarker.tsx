import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, ArrowLeft, Upload, PanelLeftClose, PanelLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CORRECT_PASSWORD = '68194934';

interface TypedWord {
  text: string;
  isCorrect: boolean;
}

const StenoMarker = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Setup state
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [wordListInput, setWordListInput] = useState('');
  const [targetRepetitions, setTargetRepetitions] = useState(100);
  const [customFontName, setCustomFontName] = useState('Kruti Dev 010');
  const [customFontLoaded, setCustomFontLoaded] = useState(false);
  
  // Practice state
  const [pendingWords, setPendingWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [typedWords, setTypedWords] = useState<TypedWord[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  // Handle custom font file upload
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
      const fontUrl = URL.createObjectURL(file);
      
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);
      
      setCustomFontName(fontName);
      setCustomFontLoaded(true);
      
      toast({
        title: "Font Loaded",
        description: `"${fontName}" is now active.`,
      });
    } catch (error) {
      toast({
        title: "Font Error",
        description: "Failed to load font file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Start practice session
  const startPractice = () => {
    const words = wordListInput
      .split(/[\s\n,]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
    
    if (words.length === 0) {
      toast({
        title: "No Words",
        description: "Please enter at least one word to practice.",
        variant: "destructive"
      });
      return;
    }

    if (targetRepetitions < 1) {
      toast({
        title: "Invalid Target",
        description: "Target repetitions must be at least 1.",
        variant: "destructive"
      });
      return;
    }

    setPendingWords(words);
    setCurrentWordIndex(0);
    setCurrentScore(0);
    setTypedWords([]);
    setTypingInput('');
    setIsSetupMode(false);

    toast({
      title: "Practice Started",
      description: `Practice ${words.length} word(s), ${targetRepetitions} times each.`,
    });
  };

  // Handle typing input
  const handleTypingKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      
      // Get the last typed word (text after last space)
      const inputText = typingInput;
      const lastSpaceIndex = inputText.lastIndexOf(' ');
      const lastWord = lastSpaceIndex === -1 ? inputText : inputText.slice(lastSpaceIndex + 1);
      
      if (lastWord.trim().length === 0) return;

      const currentTargetWord = pendingWords[currentWordIndex];
      const isCorrect = lastWord.trim() === currentTargetWord;

      // Add the word to typed history
      setTypedWords(prev => [...prev, { text: lastWord.trim(), isCorrect }]);
      
      // Update typing input with space
      setTypingInput(prev => prev + ' ');

      if (isCorrect) {
        const newScore = currentScore + 1;
        setCurrentScore(newScore);

        // Check if target reached
        if (newScore >= targetRepetitions) {
          // Move to next word
          if (currentWordIndex < pendingWords.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setCurrentScore(0);
            setTypedWords([]);
            setTypingInput('');
            
            toast({
              title: "Word Complete!",
              description: `Moving to next word: "${pendingWords[currentWordIndex + 1]}"`,
            });
          } else {
            // All words complete
            toast({
              title: "🎉 Practice Complete!",
              description: "You have completed all words!",
            });
          }
        }
      }

      // Auto-scroll
      setTimeout(() => {
        if (typingAreaRef.current) {
          typingAreaRef.current.scrollTop = typingAreaRef.current.scrollHeight;
        }
      }, 10);
    }
  };

  // Reset current word
  const resetCurrentWord = () => {
    setCurrentScore(0);
    setTypedWords([]);
    setTypingInput('');
    inputRef.current?.focus();
  };

  // Go back to setup
  const goToSetup = () => {
    setIsSetupMode(true);
  };

  // Focus input when practice starts
  useEffect(() => {
    if (!isSetupMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSetupMode]);

  // Custom font style
  const customFontStyle = {
    fontFamily: customFontLoaded ? `"${customFontName}", "Kruti Dev 010", sans-serif` : `"Kruti Dev 010", sans-serif`
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
              <Play className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Kruti Dev Typing Practice
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Enter password to access
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>
              
              {loginError && (
                <p className="text-sm text-destructive font-medium">{loginError}</p>
              )}
              
              <Button type="submit" className="w-full">
                Access Practice App
              </Button>
              
              <div className="text-center">
                <Link to="/" className="text-sm text-primary hover:text-primary/80">
                  ← Back to Main
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Setup Screen
  if (isSetupMode) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground" style={customFontStyle}>
              Kruti Dev Typing Practice
            </h1>
            <div className="w-20"></div>
          </div>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-xl">Setup Practice Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Word List Input */}
              <div className="space-y-2">
                <Label htmlFor="wordList" className="text-base font-medium">
                  Word List
                </Label>
                <Textarea
                  id="wordList"
                  placeholder="Enter words separated by spaces or new lines..."
                  value={wordListInput}
                  onChange={(e) => setWordListInput(e.target.value)}
                  className="min-h-[200px] text-xl"
                  style={customFontStyle}
                />
                <p className="text-xs text-muted-foreground">
                  Paste your word list here. Words can be separated by spaces, commas, or new lines.
                </p>
              </div>

              {/* Target Repetitions */}
              <div className="space-y-2">
                <Label htmlFor="target" className="text-base font-medium">
                  Target Repetitions
                </Label>
                <Input
                  id="target"
                  type="number"
                  value={targetRepetitions}
                  onChange={(e) => setTargetRepetitions(parseInt(e.target.value) || 100)}
                  min={1}
                  max={1000}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  How many times each word should be typed correctly.
                </p>
              </div>

              {/* Font Upload */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Custom Font (Optional)
                </Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload .ttf Font</span>
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleFontUpload}
                      className="hidden"
                    />
                  </label>
                  {customFontLoaded && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ "{customFontName}" loaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a custom font file (TTF/OTF). Default: Kruti Dev 010 (if installed locally).
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Font Preview:</p>
                <p className="text-3xl" style={customFontStyle}>
                  {wordListInput.split(/[\s\n,]+/).filter(w => w)[0] || "vkidk 'kCn ;gka fn[ksxk"}
                </p>
              </div>

              {/* Start Button */}
              <Button onClick={startPractice} className="w-full h-12 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Practice Screen
  const currentTargetWord = pendingWords[currentWordIndex] || '';
  const remainingWords = pendingWords.slice(currentWordIndex);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Pending Words */}
      {sidebarVisible && (
        <div className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Pending Words</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingWords.length} words remaining
            </p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {remainingWords.map((word, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-lg ${
                    index === 0 
                      ? 'bg-primary/10 text-primary font-bold border-2 border-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  style={customFontStyle}
                >
                  {word}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <header className="bg-white border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              >
                {sidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={goToSetup}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Setup
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={resetCurrentWord}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Word
              </Button>
            </div>
          </div>
        </header>

        {/* Target Word Display */}
        <div className="bg-gradient-to-b from-primary/5 to-background p-8 text-center border-b border-border">
          <p className="text-sm text-muted-foreground mb-2">Current Target Word</p>
          <h1 
            className="text-6xl md:text-8xl font-bold text-foreground mb-4"
            style={customFontStyle}
          >
            {currentTargetWord}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-primary">{currentScore}</span>
            <span className="text-2xl text-muted-foreground">/</span>
            <span className="text-4xl font-bold text-muted-foreground">{targetRepetitions}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Word {currentWordIndex + 1} of {pendingWords.length}
          </p>
        </div>

        {/* Typing Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div 
            ref={typingAreaRef}
            className="h-full overflow-auto p-4 bg-card border border-border rounded-lg"
          >
            {/* Typed Words History */}
            <div className="mb-4 flex flex-wrap gap-1" style={customFontStyle}>
              {typedWords.map((word, index) => (
                <span
                  key={index}
                  className={`text-2xl ${
                    word.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {word.text}{' '}
                </span>
              ))}
            </div>

            {/* Active Input */}
            <Textarea
              ref={inputRef}
              value={typingInput}
              onChange={(e) => setTypingInput(e.target.value)}
              onKeyDown={handleTypingKeyDown}
              placeholder="Start typing here... Press SPACE to check each word"
              className="min-h-[150px] text-2xl border-2 border-primary/30 focus:border-primary resize-none"
              style={customFontStyle}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">SPACE</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">ENTER</kbd> to validate each word. 
              <span className="text-green-600 ml-2">Green = Correct</span>, 
              <span className="text-red-600 ml-2">Red = Wrong</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StenoMarker;
