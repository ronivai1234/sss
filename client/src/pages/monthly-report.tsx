import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LocalTransaction } from "@shared/schema";
import { SummaryCards } from "@/components/summary-cards";
import { formatCurrency, months, years } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MonthlyReport = () => {
  const [month, setMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState<string>(new Date().getFullYear() + "");
  const [transactions] = useLocalStorage<LocalTransaction[]>("transactions", []);

  // Filter transactions for the selected month and year
  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return (
      date.getMonth() + 1 === parseInt(month, 10) &&
      date.getFullYear() === parseInt(year, 10)
    );
  });

  // Calculate monthly summary
  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Prepare data for the daily breakdown chart
  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dayTransactions = monthlyTransactions.filter((t) => {
      const date = new Date(t.date);
      return date.getDate() === day;
    });

    const dayIncome = dayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const dayExpense = dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      day,
      income: dayIncome,
      expense: dayExpense,
      profit: dayIncome - dayExpense,
    };
  }).filter(day => day.income > 0 || day.expense > 0); // Only include days with transactions

  // Prepare top income sources
  const incomeBySource: Record<string, number> = {};
  monthlyTransactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      incomeBySource[t.name] = (incomeBySource[t.name] || 0) + t.amount;
    });

  const topIncomeSources = Object.entries(incomeBySource)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Prepare major expenses
  const expenseByCategory: Record<string, number> = {};
  monthlyTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCategory[t.name] = (expenseByCategory[t.name] || 0) + t.amount;
    });

  const majorExpenses = Object.entries(expenseByCategory)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Report
        </h1>

        {/* Month Selector */}
        <Card className="mb-6 shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="month" className="block text-sm font-medium mb-1">
                  Select Month
                </Label>
                <div className="relative">
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label} {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="year" className="block text-sm font-medium mb-1">
                  Select Year
                </Label>
                <div className="relative">
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-5">
                <Button type="button">Generate Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary Card */}
        <SummaryCards
          income={totalIncome}
          expense={totalExpense}
          profit={netProfit}
          title={`${months.find(m => m.value === month)?.label} ${year} Summary`}
        />

        {/* Daily Breakdown Chart */}
        <Card className="mb-6 shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Daily Breakdown
            </h2>
          </div>
          <div className="p-6 h-80">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`৳ ${Number(value).toFixed(2)}`, ""]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                  <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No transaction data available for this month</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Top Income Sources */}
        <Card className="mb-6 shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Income Sources
            </h2>
          </div>
          <div className="overflow-x-auto">
            {topIncomeSources.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {topIncomeSources.map((source) => (
                    <tr key={source.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {source.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right income-text">
                        {formatCurrency(source.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                        {totalIncome > 0 ? ((source.amount / totalIncome) * 100).toFixed(1) + "%" : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No income data available for this month.
              </div>
            )}
          </div>
        </Card>

        {/* Major Expenses */}
        <Card className="mb-6 shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Major Expenses
            </h2>
          </div>
          <div className="overflow-x-auto">
            {majorExpenses.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {majorExpenses.map((expense) => (
                    <tr key={expense.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {expense.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right expense-text">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                        {totalExpense > 0 ? ((expense.amount / totalExpense) * 100).toFixed(1) + "%" : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No expense data available for this month.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReport;
