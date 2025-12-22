import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { DiffResult } from '@/utils/diffAlgorithm';

interface ResultDisplayProps {
  results: DiffResult[];
  useKrutiDev: boolean;
}

const ResultDisplay = ({ results, useKrutiDev }: ResultDisplayProps) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-elevated border-border bg-card print:shadow-none print:border-none" id="result-section">
      <CardHeader className="pb-3 no-print">
        <CardTitle className="flex items-center gap-2 text-lg bracket-arial">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Comparison Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          id="result-text"
          className={`result-container p-6 bg-white rounded-lg text-base leading-relaxed print:p-0 ${useKrutiDev ? 'font-kruti-dev text-xl' : ''}`}
        >
          {results.map((result, index) => {
            switch (result.type) {
              case 'correct':
                return (
                  <span key={index} className="text-foreground">
                    {result.typed}
                    <span className="bracket-arial"> </span>
                  </span>
                );
              case 'error':
                return (
                  <span key={index}>
                    <span className="text-error italic underline decoration-dotted decoration-error">{result.typed}</span>
                    <span className="bracket-arial"> [</span>
                    <span className="text-correct font-bold">{result.correct}</span>
                    <span className="bracket-arial">] </span>
                  </span>
                );
              case 'missing':
                return (
                  <span key={index}>
                    <span className="bracket-arial">[</span>
                    <span className="text-correct font-bold">{result.correct}</span>
                    <span className="bracket-arial">] </span>
                  </span>
                );
              case 'extra':
                return (
                  <span key={index} className="text-error line-through">
                    {result.typed}
                    <span className="bracket-arial"> </span>
                  </span>
                );
              default:
                return null;
            }
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm no-print bracket-arial">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-foreground border border-border">Word</span>
            <span className="text-muted-foreground">= Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded">
              <span className="text-error italic underline decoration-dotted decoration-error">wrong</span>
              <span className="bracket-arial"> [</span>
              <span className="text-correct font-bold">right</span>
              <span className="bracket-arial">]</span>
            </span>
            <span className="text-muted-foreground">= Error</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded">
              <span className="bracket-arial">[</span>
              <span className="text-correct font-bold">missing</span>
              <span className="bracket-arial">]</span>
            </span>
            <span className="text-muted-foreground">= Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-error line-through">extra</span>
            <span className="text-muted-foreground">= Extra</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;