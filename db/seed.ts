import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    // Seed example users
    const [user] = await db.insert(schema.users).values([
      {
        username: "admin",
        password: "password123", // In a real app, this would be hashed
      },
    ]).returning();

    // Seed example transactions
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    // Example transactions
    await db.insert(schema.transactions).values([
      // Today's transactions
      {
        name: "Rofik",
        amount: 120,
        type: "income",
        date: now,
        userId: user.id,
      },
      {
        name: "Online Sale",
        amount: 350,
        type: "income",
        date: now,
        userId: user.id,
      },
      {
        name: "Store Sales",
        amount: 380,
        type: "income",
        date: now,
        userId: user.id,
      },
      {
        name: "Rent",
        amount: 250,
        type: "expense",
        date: now,
        userId: user.id,
      },
      {
        name: "Electricity",
        amount: 100,
        type: "expense",
        date: now,
        userId: user.id,
      },

      // Yesterday's transactions
      {
        name: "Karim",
        amount: 280,
        type: "income",
        date: yesterday,
        userId: user.id,
      },
      {
        name: "Transportation",
        amount: 100,
        type: "expense",
        date: yesterday,
        userId: user.id,
      },

      // Two days ago transactions
      {
        name: "Online Sale",
        amount: 620,
        type: "income",
        date: twoDaysAgo,
        userId: user.id,
      },
      {
        name: "Supplies",
        amount: 150,
        type: "expense",
        date: twoDaysAgo,
        userId: user.id,
      },
      {
        name: "Employee Meal",
        amount: 200,
        type: "expense",
        date: twoDaysAgo,
        userId: user.id,
      },
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
