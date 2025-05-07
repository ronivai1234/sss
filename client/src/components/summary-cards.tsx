import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type SummaryCardsProps = {
  income: number;
  expense: number;
  profit: number;
  title: string;
};

export function SummaryCards({ income, expense, profit, title }: SummaryCardsProps) {
  return (
    <Card className="mb-6 shadow">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="income-bg rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Income</p>
            <p className="text-xl font-semibold income-text">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="expense-bg rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Expense</p>
            <p className="text-xl font-semibold expense-text">
              {formatCurrency(expense)}
            </p>
          </div>
          <div className="profit-bg rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
            <p className="text-xl font-semibold profit-text">
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
