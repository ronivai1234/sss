import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DateSelector } from "@/components/date-selector";
import { SummaryCards } from "@/components/summary-cards";
import { IncomeForm } from "@/components/income-form";
import { ExpenseForm } from "@/components/expense-form";
import { TransactionsTable } from "@/components/transactions-table";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LocalTransaction } from "@shared/schema";
import { calculateDailySummary, getToday } from "@/lib/utils";

const Home = () => {
  const [currentDate, setCurrentDate] = useState<string>(getToday());
  
  // Retrieve transactions from local storage, defaulting to empty array
  const [transactions, setTransactions] = useLocalStorage<LocalTransaction[]>("transactions", []);
  
  // Filter transactions for the current date
  const dailyTransactions = transactions.filter(
    (transaction) => transaction.date === currentDate
  );
  
  // Get income and expense transactions for the current date
  const incomeTransactions = dailyTransactions.filter((t) => t.type === "income");
  const expenseTransactions = dailyTransactions.filter((t) => t.type === "expense");
  
  // Calculate summary for the current date
  const summary = calculateDailySummary(dailyTransactions);

  // Handle editing a transaction
  const handleEdit = (transaction: LocalTransaction) => {
    const updatedTransactions = transactions.map((t) => 
      t.id === transaction.id ? transaction : t
    );
    setTransactions(updatedTransactions);
  };

  // Handle deleting a transaction
  const handleDelete = (transactionId: string) => {
    const updatedTransactions = transactions.filter((t) => t.id !== transactionId);
    setTransactions(updatedTransactions);
  };

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Daily Accounting
        </h1>
        
        {/* Date Selector */}
        <DateSelector 
          currentDate={currentDate} 
          onDateChange={setCurrentDate} 
        />

        {/* Financial Summary Card */}
        <SummaryCards 
          income={summary.income} 
          expense={summary.expense} 
          profit={summary.profit} 
          title="Today's Summary"
        />

        {/* Income Entry Form */}
        <Card className="mb-6 shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Income
            </h2>
            <IncomeForm 
              date={currentDate}
              onAddTransaction={(transaction) => {
                setTransactions([...transactions, transaction]);
              }}
            />
          </CardContent>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Today's Income Entries
            </h3>
          </div>
          
          <TransactionsTable 
            transactions={incomeTransactions} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            type="income"
          />
        </Card>

        {/* Expense Entry Form */}
        <Card className="mb-6 shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Expense
            </h2>
            <ExpenseForm 
              date={currentDate}
              onAddTransaction={(transaction) => {
                setTransactions([...transactions, transaction]);
              }}
            />
          </CardContent>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Today's Expense Entries
            </h3>
          </div>
          
          <TransactionsTable 
            transactions={expenseTransactions} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            type="expense"
          />
        </Card>
      </div>
    </div>
  );
};

export default Home;
