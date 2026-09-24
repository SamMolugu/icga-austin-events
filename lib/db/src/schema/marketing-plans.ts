import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const marketingPlansTable = pgTable("marketing_plans", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("planned"),
  publishAt: timestamp("publish_at", { withTimezone: true }),
  copy: text("copy").notNull().default(""),
  ownerName: text("owner_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMarketingPlanSchema = createInsertSchema(marketingPlansTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMarketingPlan = z.infer<typeof insertMarketingPlanSchema>;
export type MarketingPlan = typeof marketingPlansTable.$inferSelect;