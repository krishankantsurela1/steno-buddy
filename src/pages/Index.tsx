import { useState } from 'react';
import { Play, RotateCcw, BookOpen, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import TextPanel from '@/components/TextPanel';
import Dashboard from '@/components/Dashboard';
import ResultDisplay from '@/components/ResultDisplay';
import { analyzeText, type DiffResult, type AnalysisStats } from '@/utils/diffAlgorithm';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [masterText, setMasterText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [results, setResults] = useState<DiffResult[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Dashboard */}
        <Dashboard stats={stats} />

        {/* Text Panels */}
        <div className="grid md:grid-cols-2 gap-6">
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
            icon={<Keyboard className="w-5 h-5 text-info" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleAnalyze} className="min-w-[200px]">
            <Play className="w-5 h-5" />
            Analyze Accuracy
          </Button>
          <Button size="lg" variant="outline" onClick={handleReset} className="min-w-[200px]">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {/* Results */}
        <ResultDisplay results={results} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        <p>Steno Exam Evaluator • Supports Hindi (हिंदी) and English</p>
      </footer>
    </div>
  );
};

export default Index;
