import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocalTransaction } from "@shared/schema";
import { SummaryCards } from "@/components/summary-cards";
import { formatCurrency, calculateDailySummary, formatDate, getToday } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const DailyView = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [transactions] = useLocalStorage<LocalTransaction[]>("transactions", []);

  // Filter transactions for the selected date
  const dailyTransactions = transactions.filter(
    (transaction) => transaction.date === selectedDate
  );

  // Get income and expense transactions for the selected date
  const incomeTransactions = dailyTransactions.filter((t) => t.type === "income");
  const expenseTransactions = dailyTransactions.filter((t) => t.type === "expense");

  // Calculate summary for the selected date
  const summary = calculateDailySummary(dailyTransactions);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Daily View
        </h1>

        {/* Date Filter */}
        <Card className="mb-6 shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="date-filter" className="block text-sm font-medium mb-1">
                  Select Date
                </Label>
                <Input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="pt-5">
                <Button 
                  type="button" 
                  onClick={() => {
                    // Already handled by onChange event
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          profit={summary.profit}
          title={`${formatDate(selectedDate)} Summary`}
        />

        {/* Income Transactions */}
        <Card className="mb-6 shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Income Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            {incomeTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {incomeTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right income-text">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                        {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No income transactions found for this date.
              </div>
            )}
          </div>
        </Card>

        {/* Expense Transactions */}
        <Card className="mb-6 shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Expense Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            {expenseTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {expenseTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right expense-text">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                        {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No expense transactions found for this date.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyView;
