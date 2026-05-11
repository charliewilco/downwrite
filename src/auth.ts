import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { loadConfig } from "./config.js";
import { prisma } from "./db.js";

const config = loadConfig();

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL ?? `http://localhost:${config.port}`,
	secret: config.sessionSecret,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
		transaction: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		database: {
			generateId: false,
		},
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: "lax",
		},
	},
});

export type AuthSession = typeof auth.$Infer.Session;
