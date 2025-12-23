import { FileText, Highlighter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b border-border shadow-card no-print">
      <div className="text-center text-xs text-muted-foreground py-1 bg-muted/30 border-b border-border">
        Developed by <span className="font-semibold">[Krishan Kant Surela]</span>
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              [Surela Steno Accuracy Checker] Steno Evaluator
            </h1>
          </div>
          <Link 
            to="/steno-marker" 
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
          >
            <Highlighter className="w-5 h-5" />
            <span>Steno Marker</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;