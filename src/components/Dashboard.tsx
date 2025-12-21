import { BarChart3, FileText, AlertCircle, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AnalysisStats } from '@/utils/diffAlgorithm';

interface DashboardProps {
  stats: AnalysisStats | null;
}

const Dashboard = ({ stats }: DashboardProps) => {
  const items = [
    {
      label: 'Master Words',
      value: stats?.totalMasterWords ?? '-',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Typed Words',
      value: stats?.totalTypedWords ?? '-',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Errors',
      value: stats?.errors ?? '-',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Accuracy',
      value: stats ? `${stats.accuracy}%` : '-',
      icon: <Target className="w-5 h-5" />,
      color: stats && stats.accuracy >= 90 ? 'text-success' : stats && stats.accuracy >= 70 ? 'text-warning' : 'text-destructive',
      bgColor: stats && stats.accuracy >= 90 ? 'bg-success/10' : stats && stats.accuracy >= 70 ? 'bg-warning/10' : 'bg-destructive/10',
    },
  ];

  return (
    <Card className="shadow-elevated border-border bg-card animate-fade-in">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Analysis Dashboard
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center p-3 rounded-lg bg-secondary/50 transition-all duration-200 hover:bg-secondary"
            >
              <div className={`p-2 rounded-full ${item.bgColor} ${item.color} mb-2`}>
                {item.icon}
              </div>
              <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
              <span className="text-xs text-muted-foreground text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
