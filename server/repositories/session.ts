import { eq, like } from "drizzle-orm";
import { paymentSessions } from "~/server/db/schema.ts";
import { db } from "~/server/utils/db.ts";

export type Session = typeof paymentSessions.$inferSelect;
export type NewSession = typeof paymentSessions.$inferInsert;

export const sessionRepository = {
  findByCartId(cartId: string): Promise<Session | undefined> {
    return db.query.paymentSessions.findFirst({
      where: eq(paymentSessions.shopifyCartId, cartId),
    });
  },

  async create(data: NewSession): Promise<void> {
    await db.insert(paymentSessions).values(data);
  },

  async updateInfinitepay(id: string, data: { infinitepayCheckoutId: string; infinitepayCheckoutUrl: string }): Promise<void> {
    await db
      .update(paymentSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentSessions.id, id));
  },

  async resetForNewCart(id: string, data: { amount: number; currency: string; cartSnapshot: string }): Promise<void> {
    await db
      .update(paymentSessions)
      .set({ ...data, infinitepayCheckoutId: null, infinitepayCheckoutUrl: null, updatedAt: new Date() })
      .where(eq(paymentSessions.id, id));
  },

  // order_nsu enviado à InfinitePay é shopifyCartId sem query string
  findByOrderNsu(orderNsu: string): Promise<Session | undefined> {
    return db.query.paymentSessions.findFirst({
      where: like(paymentSessions.shopifyCartId, `${orderNsu}%`),
    });
  },

  async markAsPaid(id: string): Promise<void> {
    await db
      .update(paymentSessions)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(paymentSessions.id, id));
  },

  async setShopifyOrderId(id: string, shopifyOrderId: string): Promise<void> {
    await db
      .update(paymentSessions)
      .set({ shopifyOrderId, updatedAt: new Date() })
      .where(eq(paymentSessions.id, id));
  },
};
