import type { Express } from "express";
import { createServer, type Server } from "http";
import * as schema from "@shared/schema";
import { db } from "@db";
import { eq, between, and, gte, lte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Transactions API
  app.get("/api/transactions", async (req, res) => {
    try {
      const date = req.query.date as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      let query = db.select().from(schema.transactions);

      if (date) {
        // Create start and end of the day to get all transactions for that day
        const dateObj = new Date(date);
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = db.select().from(schema.transactions).where(
          and(
            gte(schema.transactions.date, startOfDay),
            lte(schema.transactions.date, endOfDay)
          )
        );
      } else if (startDate && endDate) {
        // For date range queries
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        
        query = db.select().from(schema.transactions).where(
          between(schema.transactions.date, startDateObj, endDateObj)
        );
      }

      const transactions = await query;
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = schema.insertTransactionSchema.parse(req.body);
      const [transaction] = await db.insert(schema.transactions)
        .values(transactionData)
        .returning();
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction", error });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const transactionData = schema.insertTransactionSchema.parse(req.body);
      
      const [updatedTransaction] = await db
        .update(schema.transactions)
        .set(transactionData)
        .where(eq(schema.transactions.id, id))
        .returning();
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(400).json({ message: "Failed to update transaction", error });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Monthly reports API
  app.get("/api/reports/monthly", async (req, res) => {
    try {
      const month = req.query.month as string;
      const year = req.query.year as string;
      
      if (!month || !year) {
        return res.status(400).json({ message: "Month and year are required" });
      }

      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      // Create date range for the month
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Last day of month
      
      // Query transactions within the date range
      const monthlyTransactions = await db.select()
        .from(schema.transactions)
        .where(
          between(schema.transactions.date, startDate, endDate)
        );
      
      // Filter and calculate summaries using the more efficient database query results
      const incomeTransactions = monthlyTransactions.filter(t => t.type === "income");
      const expenseTransactions = monthlyTransactions.filter(t => t.type === "expense");
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount as number), 0);
      const totalExpense = expenseTransactions.reduce((sum, t) => sum + (t.amount as number), 0);
      const netProfit = totalIncome - totalExpense;
      
      res.json({
        transactions: monthlyTransactions,
        summary: {
          totalIncome,
          totalExpense,
          netProfit
        }
      });
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ message: "Failed to generate monthly report" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
