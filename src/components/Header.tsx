import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-border shadow-card no-print">
      <div className="text-center text-xs text-muted-foreground py-1 bg-muted/30 border-b border-border">
        Developed by <span className="font-semibold">[Krishan Kant Surela]</span>
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            [Surela Steno Accuracy Checker] Steno Evaluator
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;