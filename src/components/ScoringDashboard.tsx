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

  const rows = [
    { label: 'Total Words in Master Text', value: stats.totalMasterWords },
    { label: 'Total Words Typed', value: stats.totalTypedWords },
    { label: 'Correct Words', value: correctWords },
    { label: 'Total Mistakes (Full + Half)', value: stats.errors },
    { label: 'Accuracy Percentage', value: `${stats.accuracy}%` },
    { label: 'Total Marks', value: totalMarks },
  ];

  return (
    <Card className="shadow-elevated border-border bg-card print:shadow-none print:border-2 print:border-foreground">
      <CardHeader className="pb-3 print:pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary no-print" />
          Scoring Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted print:bg-gray-200">
                <th className="text-left px-4 py-2 border border-border font-semibold">Metric</th>
                <th className="text-right px-4 py-2 border border-border font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                  <td className="px-4 py-2 border border-border">{row.label}</td>
                  <td className="px-4 py-2 border border-border text-right font-mono font-semibold">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringDashboard;
