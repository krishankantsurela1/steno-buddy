import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Play } from 'lucide-react';

const TypingTest: React.FC = () => {
  const [referenceText, setReferenceText] = useState<string>('');
  const [referenceWords, setReferenceWords] = useState<string[]>([]);
  const [userWords, setUserWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 1. Helper Function for Word Comparison
  const checkWordLogic = (original: string, typed: string | undefined): string => {
    if (!typed) return "pending";
    
    // The Normalization Map
    const map: Record<string, string> = {
      "ä": "Dr", "Ñ": "d`", "Ø": "dz", "Ù": "Rr",
      "˜": "n~n", "™": "n~`", "š": "n~o", "¶": "Q~", "Ì": "n~nk",
      "U": "a", "E": "a", "i": "a", "j": "a", ".": "a"
    };

    const normalize = (txt: string): string => {
      let clean = txt;
      Object.entries(map).forEach(([k, v]) => {
        const regex = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        clean = clean.replace(regex, v);
      });
      return clean;
    };

    // Compare normalized versions
    return normalize(original) === normalize(typed) ? "correct" : "wrong";
  };

  const initializeTest = () => {
    if (!referenceText.trim()) return;
    
    const words = referenceText.trim().split(/\s+/).filter(w => w.length > 0);
    setReferenceWords(words);
    setUserWords([]);
    setCurrentInput('');
    setIsStarted(true);
    setShowSetup(false);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Check if space was pressed (word completed)
    if (value.endsWith(' ') || value.endsWith('\n')) {
      const typedWord = value.trim();
      
      if (typedWord && userWords.length < referenceWords.length) {
        setUserWords(prev => [...prev, typedWord]);
        setCurrentInput('');
      }
    } else {
      setCurrentInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }
  };

  const resetTest = () => {
    setReferenceWords([]);
    setUserWords([]);
    setCurrentInput('');
    setIsStarted(false);
    setShowSetup(true);
  };

  const isFinished = userWords.length >= referenceWords.length && referenceWords.length > 0;
  const correctCount = referenceWords.filter((word, i) => checkWordLogic(word, userWords[i]) === "correct").length;
  const wrongCount = referenceWords.filter((word, i) => checkWordLogic(word, userWords[i]) === "wrong").length;
  const accuracy = referenceWords.length > 0 ? Math.round((correctCount / referenceWords.length) * 100) : 0;

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
                    <span>Words: <strong>{userWords.length}/{referenceWords.length}</strong></span>
                    <span className="text-green-600">Correct: <strong>{correctCount}</strong></span>
                    <span className="text-red-500">Errors: <strong>{wrongCount}</strong></span>
                    <span>Accuracy: <strong>{accuracy}%</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetTest}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>

                {/* 2. Word Display Area - EXACT RENDERING LOOP */}
                <div 
                  className="p-6 bg-card border rounded-lg min-h-[200px] leading-loose text-xl"
                  style={{ fontFamily: "'Kruti Dev 010', Arial, sans-serif" }}
                >
                  {referenceWords.map((word, index) => {
                    const userTypedWord = userWords[index];
                    const status = checkWordLogic(word, userTypedWord);
                    const isCurrent = index === userWords.length;

                    // SCENARIO 1: Not typed yet
                    if (status === "pending" && !isCurrent) {
                      return <span key={index} className="text-gray-500 mr-2">{word}</span>;
                    }

                    // SCENARIO 2: Currently typing (Highlight Blue)
                    if (isCurrent) {
                      return <span key={index} className="bg-blue-100 dark:bg-blue-900/30 mr-2 px-1 rounded">{word}</span>;
                    }

                    // SCENARIO 3: CORRECT (Green ONLY - NO Brackets)
                    if (status === "correct") {
                      return <span key={index} className="text-green-600 mr-2">{word}</span>;
                    }

                    // SCENARIO 4: WRONG (Red Strikethrough + Green Bracket)
                    if (status === "wrong") {
                      return (
                        <span key={index} className="mr-2">
                          <span className="text-red-500 line-through mr-1">{userTypedWord}</span>
                          <span className="text-green-700" style={{ fontFamily: 'Arial' }}>[</span>
                          <span className="text-green-700">{word}</span>
                          <span className="text-green-700" style={{ fontFamily: 'Arial' }}>]</span>
                        </span>
                      );
                    }

                    return null;
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
                      Accuracy: {accuracy}% ({correctCount}/{referenceWords.length} correct)
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
