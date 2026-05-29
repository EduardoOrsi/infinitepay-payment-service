import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const paymentSessions = sqliteTable("payment_sessions", {
  id: text("id").primaryKey(),
  shopifyCartId: text("shopify_cart_id").notNull(),
  status: text("status", { enum: ["pending", "paid", "failed"] }).notNull().default("pending"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("BRL"),
  infinitepayCheckoutId: text("infinitepay_checkout_id"),
  infinitepayCheckoutUrl: text("infinitepay_checkout_url"),
  shopifyOrderId: text("shopify_order_id"),
  cartSnapshot: text("cart_snapshot").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, table => [
  uniqueIndex("idx_one_pending_per_cart").on(table.shopifyCartId).where(sql`${table.status} = 'pending'`),
]);

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  providerEventId: text("provider_event_id").notNull().unique(),
  type: text("type").notNull(),
  payload: text("payload").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }).notNull(),
});
