import { eq } from "drizzle-orm";
import { webhookEvents } from "~/server/db/schema.ts";
import { db } from "~/server/utils/db.ts";

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;

export const webhookEventRepository = {
  findByProviderEventId(providerEventId: string): Promise<WebhookEvent | undefined> {
    return db.query.webhookEvents.findFirst({
      where: eq(webhookEvents.providerEventId, providerEventId),
    });
  },

  async create(data: NewWebhookEvent): Promise<void> {
    await db.insert(webhookEvents).values(data);
  },
};
