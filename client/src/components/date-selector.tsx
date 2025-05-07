import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type DateSelectorProps = {
  currentDate: string;
  onDateChange: (date: string) => void;
};

export function DateSelector({ currentDate, onDateChange }: DateSelectorProps) {
  return (
    <Card className="mb-6 shadow">
      <CardContent className="p-4">
        <Label htmlFor="date" className="block text-sm font-medium mb-2">
          Select Date
        </Label>
        <Input
          type="date"
          id="date"
          value={currentDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
