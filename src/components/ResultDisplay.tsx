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
    <Card className="shadow-elevated border-border bg-card animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Comparison Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-secondary/30 rounded-lg text-base leading-loose whitespace-pre-wrap">
          {results.map((result, index) => {
            switch (result.type) {
              case 'correct':
                return (
                  <span key={index} className="text-foreground">
                    {result.typed}{' '}
                  </span>
                );
              case 'error':
                return (
                  <span key={index}>
                    <span className="text-error">{result.typed}</span>
                    <span className="text-correct">({result.correct})</span>{' '}
                  </span>
                );
              case 'missing':
                return (
                  <span key={index} className="text-missing">
                    {result.correct}{' '}
                  </span>
                );
              case 'extra':
                return (
                  <span key={index} className="text-extra">
                    {result.typed}{' '}
                  </span>
                );
              default:
                return null;
            }
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-foreground"></span>
            <span className="text-muted-foreground">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-destructive"></span>
            <span className="text-muted-foreground">Error (with correction)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-success"></span>
            <span className="text-muted-foreground">Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-info"></span>
            <span className="text-muted-foreground">Extra (strikethrough)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
