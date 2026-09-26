import { createInsertSchema } from "drizzle-zod";
import { doublePrecision, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const fundsTable = pgTable("funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  goal: doublePrecision("goal").notNull().default(0),
  raised: doublePrecision("raised").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFundSchema = createInsertSchema(fundsTable).omit({
  id: true,
  raised: true,
  createdAt: true,
});
export type InsertFund = z.infer<typeof insertFundSchema>;
export type Fund = typeof fundsTable.$inferSelect;
