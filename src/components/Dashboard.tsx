import { FileText, Keyboard, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AnalysisStats } from '@/utils/diffAlgorithm';

interface DashboardProps {
  stats: AnalysisStats | null;
}

const Dashboard = ({ stats }: DashboardProps) => {
  const items = [
    {
      label: 'Total Words',
      value: stats?.totalMasterWords ?? '-',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-primary',
    },
    {
      label: 'Typed Words',
      value: stats?.totalTypedWords ?? '-',
      icon: <Keyboard className="w-5 h-5" />,
      color: 'text-primary',
    },
    {
      label: 'Total Penalty',
      value: stats?.totalPenalty ?? '-',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600',
    },
    {
      label: 'Accuracy %',
      value: stats ? `${stats.accuracy}%` : '-',
      icon: <Target className="w-5 h-5" />,
      color: stats && stats.accuracy >= 90 ? 'text-green-600' : stats && stats.accuracy >= 70 ? 'text-yellow-600' : 'text-red-600',
    },
  ];

  return (
    <Card className="shadow-card border-border bg-white">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <div className={`${item.color}`}>
                {item.icon}
              </div>
              <div>
                <span className={`text-xl font-bold ${item.color} block`}>{item.value}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
