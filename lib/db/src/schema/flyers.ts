import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const flyersTable = pgTable("flyers", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  submittedBy: text("submitted_by").notNull(),
  status: text("status").notNull().default("pending"),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const insertFlyerSchema = createInsertSchema(flyersTable).omit({
  id: true,
  status: true,
  reviewNote: true,
  createdAt: true,
  reviewedAt: true,
});
export type InsertFlyer = z.infer<typeof insertFlyerSchema>;
export type Flyer = typeof flyersTable.$inferSelect;
