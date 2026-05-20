import { auth } from "./auth.js";
import { prisma } from "./db.js";
import { ensureWorkspaceForUser } from "./store.js";
import { testUser } from "./test-user.js";

async function main() {
	const existing = await prisma.user.findUnique({
		where: { email: testUser.email },
	});
	if (existing) {
		await ensureWorkspaceForUser(existing);
		console.log(`Test user already exists: ${testUser.email}`);
		return;
	}

	const response = await auth.handler(
		new Request("http://127.0.0.1/api/auth/sign-up/email", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: testUser.name,
				email: testUser.email,
				password: testUser.password,
			}),
		}),
	);

	if (!response.ok) {
		throw new Error(await response.text());
	}

	const payload = (await response.json()) as {
		user?: { id: string; name: string };
	};
	if (!payload.user) {
		throw new Error("Better Auth did not return a user while seeding");
	}

	await ensureWorkspaceForUser(payload.user);
	console.log(`Created test user: ${testUser.email}`);
}

main()
	.finally(async () => {
		await prisma.$disconnect();
	})
	.catch((error: unknown) => {
		console.error(error);
		process.exit(1);
	});
