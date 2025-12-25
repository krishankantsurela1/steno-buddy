import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Play, Pause } from 'lucide-react';

// Normalization Map for Alt Code Bypassing
const NORMALIZATION_MAP: Record<string, string> = {
  // --- Mandatory Rules ---
  "ä": "Dr",
  "Ñ": "d`",
  "Ø": "dz",
  "Ù": "Rr",
  "˜": "n~n",
  "™": "n~`",
  "š": "n~o",
  "¶": "Q~",
  "Ì": "n~nk",
  // --- Visual/Common Mistake Bypasses ---
  "U": "a", "E": "a", "i": "a", "j": "a", ".": "a"
};

const normalize = (text: string): string => {
  let clean = text;
  Object.entries(NORMALIZATION_MAP).forEach(([key, val]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    clean = clean.replace(regex, val);
  });
  return clean;
};

const checkWordMatch = (original: string, typed: string): boolean => {
  if (!original || !typed) return false;
  return normalize(original) === normalize(typed);
};

interface WordState {
  original: string;
  typed: string | null;
  status: 'pending' | 'current' | 'correct' | 'incorrect';
}

const TypingTest: React.FC = () => {
  const [referenceText, setReferenceText] = useState<string>('');
  const [words, setWords] = useState<WordState[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initializeTest = useCallback(() => {
    if (!referenceText.trim()) return;
    
    const wordList = referenceText.trim().split(/\s+/).filter(w => w.length > 0);
    const initialWords: WordState[] = wordList.map((word, index) => ({
      original: word,
      typed: null,
      status: index === 0 ? 'current' : 'pending'
    }));
    
    setWords(initialWords);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setIsStarted(true);
    setIsFinished(false);
    setShowSetup(false);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [referenceText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Check if space was pressed (word completed)
    if (value.endsWith(' ') || value.endsWith('\n')) {
      const typedWord = value.trim();
      
      if (typedWord && currentWordIndex < words.length) {
        const originalWord = words[currentWordIndex].original;
        const isCorrect = checkWordMatch(originalWord, typedWord);
        
        setWords(prev => {
          const updated = [...prev];
          updated[currentWordIndex] = {
            ...updated[currentWordIndex],
            typed: typedWord,
            status: isCorrect ? 'correct' : 'incorrect'
          };
          
          // Set next word as current
          if (currentWordIndex + 1 < updated.length) {
            updated[currentWordIndex + 1] = {
              ...updated[currentWordIndex + 1],
              status: 'current'
            };
          }
          
          return updated;
        });
        
        if (currentWordIndex + 1 >= words.length) {
          setIsFinished(true);
        } else {
          setCurrentWordIndex(prev => prev + 1);
        }
        
        setCurrentInput('');
      }
    } else {
      setCurrentInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent spacebar from scrolling
    if (e.key === ' ') {
      e.stopPropagation();
    }
  };

  const resetTest = () => {
    setWords([]);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setIsStarted(false);
    setIsFinished(false);
    setShowSetup(true);
  };

  const getStats = () => {
    const correct = words.filter(w => w.status === 'correct').length;
    const incorrect = words.filter(w => w.status === 'incorrect').length;
    const total = words.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, incorrect, total, accuracy };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center">Typing Test</CardTitle>
          </CardHeader>
          <CardContent>
            {showSetup ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-muted-foreground">
                  Enter Reference Paragraph (Kruti Dev):
                </label>
                <Textarea
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  placeholder="Paste your reference text here..."
                  className="min-h-[150px] font-mono text-lg"
                  style={{ fontFamily: "'Kruti Dev 010', Arial, sans-serif" }}
                />
                <Button 
                  onClick={initializeTest} 
                  className="w-full"
                  disabled={!referenceText.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Test
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Bar */}
                <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3">
                  <div className="flex gap-6 text-sm">
                    <span>Words: <strong>{stats.correct + stats.incorrect}/{stats.total}</strong></span>
                    <span className="text-green-600">Correct: <strong>{stats.correct}</strong></span>
                    <span className="text-red-500">Errors: <strong>{stats.incorrect}</strong></span>
                    <span>Accuracy: <strong>{stats.accuracy}%</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetTest}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>

                {/* Word Display Area */}
                <div 
                  className="p-6 bg-card border rounded-lg min-h-[200px] leading-loose text-xl"
                  style={{ fontFamily: "'Kruti Dev 010', Arial, sans-serif" }}
                >
                  {words.map((word, index) => {
                    if (word.status === 'correct') {
                      // Correct: Green only, no brackets
                      return (
                        <span key={index} className="text-green-600 mr-2">
                          {word.original}
                        </span>
                      );
                    } else if (word.status === 'incorrect') {
                      // Incorrect: Red strikethrough + Green brackets
                      return (
                        <span key={index} className="mr-2">
                          <span className="text-red-500 line-through mr-1">{word.typed}</span>
                          <span className="text-green-700 font-semibold">
                            <span style={{ fontFamily: 'Arial' }}>[</span>
                            {word.original}
                            <span style={{ fontFamily: 'Arial' }}>]</span>
                          </span>
                        </span>
                      );
                    } else if (word.status === 'current') {
                      // Current: Blue highlight
                      return (
                        <span 
                          key={index} 
                          className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded mr-2 text-foreground"
                        >
                          {word.original}
                        </span>
                      );
                    } else {
                      // Pending: Gray text
                      return (
                        <span key={index} className="text-muted-foreground mr-2">
                          {word.original}
                        </span>
                      );
                    }
                  })}
                </div>

                {/* Input Area */}
                {!isFinished ? (
                  <Textarea
                    ref={inputRef}
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Start typing here... Press SPACE after each word"
                    className="text-xl min-h-[80px]"
                    style={{ fontFamily: "'Kruti Dev 010', Arial, sans-serif" }}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                ) : (
                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                      Test Complete!
                    </h3>
                    <p className="text-muted-foreground">
                      Accuracy: {stats.accuracy}% ({stats.correct}/{stats.total} correct)
                    </p>
                    <Button onClick={resetTest} className="mt-4">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start New Test
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TypingTest;
