import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-border shadow-card no-print">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Steno Exam Evaluator
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;