import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TextPanelProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}

const TextPanel = ({ label, placeholder, value, onChange, icon }: TextPanelProps) => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <Label className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
        {icon}
        {label}
      </Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[300px] md:min-h-[400px] resize-none text-base leading-relaxed bg-card border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-soft"
      />
    </div>
  );
};

export default TextPanel;
