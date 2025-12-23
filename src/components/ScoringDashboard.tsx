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

  const items = [
    { label: 'Total Words (Original)', value: stats.totalMasterWords },
    { label: 'Typed Words', value: stats.totalTypedWords },
    { label: 'Full Mistakes (1.0)', value: stats.fullMistakes, highlight: 'error' },
    { label: 'Half Mistakes (0.5)', value: stats.halfMistakes, highlight: 'warning' },
    { label: 'Total Penalty', value: stats.totalPenalty },
    { label: 'Marks (out of 100)', value: stats.marks, highlight: 'success' },
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
              className={`flex flex-col items-center px-4 py-3 rounded-lg min-w-[120px] print:bg-transparent print:border print:border-foreground ${
                item.highlight === 'error' ? 'bg-red-100' : 
                item.highlight === 'warning' ? 'bg-yellow-100' : 
                item.highlight === 'success' ? 'bg-green-100' : 'bg-muted/50'
              }`}
            >
              <span className="text-xs text-muted-foreground text-center print:text-foreground">{item.label}</span>
              <span className={`text-xl font-bold ${
                item.highlight === 'error' ? 'text-red-600' : 
                item.highlight === 'warning' ? 'text-yellow-600' : 
                item.highlight === 'success' ? 'text-green-600' : 'text-foreground'
              }`}>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringDashboard;