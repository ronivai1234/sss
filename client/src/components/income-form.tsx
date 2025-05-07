import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocalTransaction } from "@shared/schema";
import { generateTransactionId } from "@/lib/utils";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
});

type IncomeFormProps = {
  date: string;
  onAddTransaction: (transaction: LocalTransaction) => void;
};

export function IncomeForm({ date, onAddTransaction }: IncomeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const transaction: LocalTransaction = {
      id: generateTransactionId(),
      name: values.name,
      amount: values.amount,
      type: "income",
      date: date,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(transaction);
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name/Source</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Rofik" 
                    {...field} 
                  />
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
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="e.g., 120" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center text-white bg-primary hover:bg-primary-dark"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="-ml-1 mr-2 h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Add Income
          </Button>
        </div>
      </form>
    </Form>
  );
}
