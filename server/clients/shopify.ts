import { env } from "~/server/utils/env.ts";

const CREATE_DRAFT_ORDER = /* graphql */ `
  mutation DraftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const COMPLETE_DRAFT_ORDER = /* graphql */ `
  mutation DraftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        id
        order {
          id
          name
          displayFinancialStatus
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

async function graphql<T>(query: string, variables: unknown): Promise<T> {
  const { shopifyStoreDomain, shopifyAdminApiToken, shopifyApiVersion } = env;

  if (!shopifyStoreDomain || !shopifyAdminApiToken) {
    throw new Error("Shopify não configurado: defina SHOPIFY_STORE_DOMAIN e SHOPIFY_ADMIN_API_TOKEN no .env");
  }

  const response = await fetch(
    `https://${shopifyStoreDomain}/admin/api/${shopifyApiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyAdminApiToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Shopify Admin API ${response.status}: ${text}`);
  }

  const result = await response.json() as GraphQLResponse<T>;

  if (result.errors?.length) {
    throw new Error(`Shopify GraphQL: ${result.errors.map(e => e.message).join(", ")}`);
  }

  return result.data;
}

export interface ShopifyLineItem {
  title: string;
  quantity: number;
  price: number; // centavos
}

export const shopifyClient = {
  async createAndCompleteDraftOrder(params: {
    lineItems: ShopifyLineItem[];
    note: string;
    customAttributes: Array<{ key: string; value: string }>;
  }): Promise<string> {
    const createData = await graphql<{
      draftOrderCreate: {
        draftOrder: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(CREATE_DRAFT_ORDER, {
      input: {
        lineItems: params.lineItems.map(item => ({
          title: item.title,
          quantity: item.quantity,
          originalUnitPrice: (item.price / 100).toFixed(2),
          taxable: false,
        })),
        taxExempt: true,
        note: params.note,
        customAttributes: params.customAttributes,
      },
    });

    const { draftOrder, userErrors } = createData.draftOrderCreate;

    if (userErrors.length > 0 || !draftOrder) {
      throw new Error(`draftOrderCreate: ${JSON.stringify(userErrors)}`);
    }

    const completeData = await graphql<{
      draftOrderComplete: {
        draftOrder: { order: { id: string; name: string } | null } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(COMPLETE_DRAFT_ORDER, { id: draftOrder.id });

    const { draftOrder: completed, userErrors: completeErrors } = completeData.draftOrderComplete;

    if (completeErrors.length > 0 || !completed?.order) {
      throw new Error(`draftOrderComplete: ${JSON.stringify(completeErrors)}`);
    }

    return completed.order.id;
  },
};
