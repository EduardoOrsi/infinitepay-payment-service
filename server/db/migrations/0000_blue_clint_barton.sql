CREATE TABLE `payment_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`shopify_cart_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`infinitepay_checkout_id` text,
	`shopify_order_id` text,
	`cart_snapshot` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_sessions_shopify_cart_id_unique` ON `payment_sessions` (`shopify_cart_id`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_event_id` text NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`processed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_events_provider_event_id_unique` ON `webhook_events` (`provider_event_id`);