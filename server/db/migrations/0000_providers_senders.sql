CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "mailboxes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"provider" text DEFAULT 'resend' NOT NULL,
	"api_key_enc" text,
	"from_address" text,
	"domain" text,
	"inbound_address" text,
	"resend_webhook_id" text,
	"webhook_secret_enc" text,
	"smtp_host" text,
	"smtp_port" integer,
	"smtp_secure" boolean DEFAULT true NOT NULL,
	"smtp_user_enc" text,
	"smtp_pass_enc" text,
	"imap_host" text,
	"imap_port" integer,
	"imap_secure" boolean DEFAULT true NOT NULL,
	"imap_user_enc" text,
	"imap_pass_enc" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_senders" (
	"id" text PRIMARY KEY NOT NULL,
	"mailbox_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mails" (
	"id" text PRIMARY KEY NOT NULL,
	"mailbox_id" text NOT NULL,
	"resend_email_id" text NOT NULL,
	"source" text DEFAULT 'resend' NOT NULL,
	"from_name" text,
	"from_email" text NOT NULL,
	"to" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cc" jsonb DEFAULT '[]'::jsonb,
	"bcc" jsonb DEFAULT '[]'::jsonb,
	"subject" text DEFAULT '' NOT NULL,
	"body_text" text,
	"body_html" text,
	"preview" text,
	"received_at" timestamp with time zone NOT NULL,
	"message_id" text,
	"folder" text DEFAULT 'inbox' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"starred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"mail_id" text NOT NULL,
	"resend_attachment_id" text,
	"filename" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"content_type" text,
	"disposition" text,
	"download_url" text,
	"expires_at" timestamp with time zone,
	"data" "bytea",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox_senders" ADD CONSTRAINT "mailbox_senders_mailbox_id_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mails" ADD CONSTRAINT "mails_mailbox_id_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_mail_id_mails_id_fk" FOREIGN KEY ("mail_id") REFERENCES "public"."mails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mailbox_senders_mailbox_email_idx" ON "mailbox_senders" USING btree ("mailbox_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "mails_mailbox_resend_idx" ON "mails" USING btree ("mailbox_id","resend_email_id");