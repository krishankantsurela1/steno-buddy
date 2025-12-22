import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { AnalysisStats } from '@/utils/diffAlgorithm';

interface ScoringDashboardProps {
  stats: AnalysisStats | null;
  isVisible: boolean;
}

const ScoringDashboard = ({ stats, isVisible }: ScoringDashboardProps) => {
  if (!isVisible || !stats) {
    return null;
  }

  const correctWords = stats.totalMasterWords - stats.errors;
  const totalMarks = Math.max(0, Math.round(correctWords * 0.5 * 100) / 100); // 0.5 marks per correct word

  const items = [
    { label: 'Total Master Words', value: stats.totalMasterWords },
    { label: 'Typed Words', value: stats.totalTypedWords },
    { label: 'Correct Words', value: correctWords },
    { label: 'Total Errors (Full + Half)', value: stats.errors },
    { label: 'Accuracy', value: `${stats.accuracy}%` },
    { label: 'Total Marks', value: totalMarks },
  ];

  return (
    <Card className="shadow-elevated border-border bg-card print:shadow-none print:border-none">
      <CardHeader className="pb-3 print:pb-2">
        <CardTitle className="flex items-center gap-2 text-lg bracket-arial">
          <BarChart3 className="w-5 h-5 text-primary no-print" />
          Scoring Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center bracket-arial">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center px-4 py-3 bg-muted/50 rounded-lg min-w-[120px] print:bg-transparent print:border print:border-foreground"
            >
              <span className="text-xs text-muted-foreground text-center print:text-foreground">{item.label}</span>
              <span className="text-xl font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringDashboard;