import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <header className="gradient-header text-primary-foreground py-4 px-6 shadow-elevated">
      <div className="container mx-auto flex items-center gap-3">
        <div className="p-2 bg-primary-foreground/10 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Steno Exam Evaluator</h1>
          <p className="text-primary-foreground/80 text-sm">Accurate stenography comparison tool</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
