import { boolean, integer, pgTable } from "drizzle-orm/pg-core";

export const notificationPreferencesTable = pgTable("notification_preferences", {
  id: integer("id").primaryKey().default(1),
  emailReminders: boolean("email_reminders").notNull().default(true),
  registrationAlerts: boolean("registration_alerts").notNull().default(true),
  donationUpdates: boolean("donation_updates").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(false),
});

export type NotificationPreferences = typeof notificationPreferencesTable.$inferSelect;