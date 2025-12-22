import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, FileText, Calendar } from 'lucide-react';

interface ExamHeaderProps {
  studentName: string;
  testNumber: string;
  examDate: string;
  onStudentNameChange: (value: string) => void;
  onTestNumberChange: (value: string) => void;
  onExamDateChange: (value: string) => void;
}

const ExamHeader = ({
  studentName,
  testNumber,
  examDate,
  onStudentNameChange,
  onTestNumberChange,
  onExamDateChange,
}: ExamHeaderProps) => {
  return (
    <>
      {/* Input fields - hidden in print */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border no-print">
        <div className="space-y-2">
          <Label htmlFor="studentName" className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4 text-primary" />
            Student Name
          </Label>
          <Input
            id="studentName"
            placeholder="Enter student name"
            value={studentName}
            onChange={(e) => onStudentNameChange(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testNumber" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="w-4 h-4 text-primary" />
            Test Number
          </Label>
          <Input
            id="testNumber"
            placeholder="Enter test number"
            value={testNumber}
            onChange={(e) => onTestNumberChange(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="examDate" className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            Date & Time (IST)
          </Label>
          <Input
            id="examDate"
            type="text"
            value={examDate}
            onChange={(e) => onExamDateChange(e.target.value)}
            className="bg-background"
            placeholder="DD/MM/YYYY | HH:MM AM/PM"
          />
        </div>
      </div>

      {/* Print-only header display */}
      <div className="hidden print:block mb-4 p-4 border-b-2 border-foreground">
        <h1 className="text-2xl font-bold text-center mb-4 bracket-arial">Steno Performance Report</h1>
        <div className="grid grid-cols-3 gap-4 text-sm bracket-arial">
          <div>
            <span className="font-semibold">Student Name:</span> {studentName || '_______________'}
          </div>
          <div>
            <span className="font-semibold">Test Number:</span> {testNumber || '_______________'}
          </div>
          <div>
            <span className="font-semibold">Date & Time:</span> {examDate || '_______________'}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamHeader;