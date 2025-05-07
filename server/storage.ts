import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, between } from "drizzle-orm";

export const storage = {
  // User operations
  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  },
  
  async insertUser(user: schema.InsertUser) {
    const [createdUser] = await db.insert(schema.users)
      .values(user)
      .returning();
    return createdUser;
  },
  
  // Transaction operations
  async getAllTransactions() {
    return await db.query.transactions.findMany({
      orderBy: (transactions) => transactions.date,
    });
  },
  
  async getTransactionsByDate(date: string) {
    const targetDate = new Date(date);
    return await db.query.transactions.findMany({
      where: eq(schema.transactions.date, targetDate),
      orderBy: (transactions) => transactions.date,
    });
  },
  
  async getTransactionsByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return await db.query.transactions.findMany({
      where: between(schema.transactions.date, start, end),
      orderBy: (transactions) => transactions.date,
    });
  },
  
  async insertTransaction(transaction: schema.InsertTransaction) {
    const [createdTransaction] = await db.insert(schema.transactions)
      .values(transaction)
      .returning();
    return createdTransaction;
  },
  
  async updateTransaction(id: number, transaction: Partial<schema.InsertTransaction>) {
    const [updatedTransaction] = await db.update(schema.transactions)
      .set(transaction)
      .where(eq(schema.transactions.id, id))
      .returning();
    return updatedTransaction;
  },
  
  async deleteTransaction(id: number) {
    return await db.delete(schema.transactions)
      .where(eq(schema.transactions.id, id));
  },
  
  // Monthly report operations
  async getMonthlyTransactions(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await db.query.transactions.findMany({
      where: between(schema.transactions.date, startDate, endDate),
      orderBy: (transactions) => transactions.date,
    });
  },
  
  // Calculate monthly summary
  async getMonthlyReport(month: number, year: number) {
    const transactions = await this.getMonthlyTransactions(month, year);
    
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (t.amount as number), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount as number), 0);
    
    const netProfit = totalIncome - totalExpense;
    
    return {
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        netProfit
      }
    };
  }
};
