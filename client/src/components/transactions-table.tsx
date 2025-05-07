import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocalTransaction } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

type TransactionsTableProps = {
  transactions: LocalTransaction[];
  onEdit: (transaction: LocalTransaction) => void;
  onDelete: (id: string) => void;
  type: "income" | "expense";
};

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
});

export function TransactionsTable({ transactions, onEdit, onDelete, type }: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<LocalTransaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: undefined,
    },
  });

  const handleEditClick = (transaction: LocalTransaction) => {
    setEditingTransaction(transaction);
    form.reset({
      name: transaction.name,
      amount: transaction.amount,
    });
    setDialogOpen(true);
  };

  const handleSaveEdit = (values: z.infer<typeof formSchema>) => {
    if (editingTransaction) {
      const updatedTransaction: LocalTransaction = {
        ...editingTransaction,
        name: values.name,
        amount: values.amount,
      };
      onEdit(updatedTransaction);
      setDialogOpen(false);
      setEditingTransaction(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No {type} transactions for today.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {transaction.name}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                  type === "income" ? "income-text" : "expense-text"
                }`}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-primary hover:text-primary-dark mr-3"
                    onClick={() => handleEditClick(transaction)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-destructive hover:text-red-700"
                    onClick={() => onDelete(transaction.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {type === "income" ? "Income" : "Expense"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (৳)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
