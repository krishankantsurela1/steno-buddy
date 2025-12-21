import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { DiffResult } from '@/utils/diffAlgorithm';

interface ResultDisplayProps {
  results: DiffResult[];
}

const ResultDisplay = ({ results }: ResultDisplayProps) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-elevated border-border bg-card" id="result-section">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Comparison Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="result-container p-6 bg-white border border-border rounded-lg text-base leading-relaxed">
          {results.map((result, index) => {
            switch (result.type) {
              case 'correct':
                return (
                  <span key={index} className="text-black">
                    {result.typed}{' '}
                  </span>
                );
              case 'error':
                return (
                  <span key={index}>
                    <span className="text-red-600">{result.typed}</span>
                    <span className="bracket-arial">[</span>
                    <span className="text-green-700 font-bold">{result.correct}</span>
                    <span className="bracket-arial">]</span>{' '}
                  </span>
                );
              case 'missing':
                return (
                  <span key={index}>
                    <span className="bracket-arial">[</span>
                    <span className="text-green-700 font-bold">{result.correct}</span>
                    <span className="bracket-arial">]</span>{' '}
                  </span>
                );
              case 'extra':
                return (
                  <span key={index} className="text-red-600 line-through">
                    {result.typed}{' '}
                  </span>
                );
              default:
                return null;
            }
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm no-print">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-black border border-border">Word</span>
            <span className="text-muted-foreground">= Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded">
              <span className="text-red-600">wrong</span>
              <span className="bracket-arial">[</span>
              <span className="text-green-700 font-bold">right</span>
              <span className="bracket-arial">]</span>
            </span>
            <span className="text-muted-foreground">= Error</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded">
              <span className="bracket-arial">[</span>
              <span className="text-green-700 font-bold">missing</span>
              <span className="bracket-arial">]</span>
            </span>
            <span className="text-muted-foreground">= Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-red-600 line-through">extra</span>
            <span className="text-muted-foreground">= Extra</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
