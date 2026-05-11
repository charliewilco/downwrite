import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("runs the core document workflow", async ({ context, page }) => {
	const runID = randomUUID();
	const user = {
		name: "E2E Test User",
		email: `downwrite-e2e-${runID}@example.com`,
		password: "downwrite-e2e-password",
	};
	const document = {
		title: `E2E Document ${runID}`,
		slug: `e2e-document-${runID}`,
		initial: "# Launch note\n\nThis is the first draft.\n\n- alpha",
		updated:
			"# Launch note\n\nThis is the revised draft with provenance.\n\n- alpha\n- beta",
		quote: "revised draft",
		comment: "This revision is ready for review.",
		reply: "Confirmed in the browser flow.",
	};

	await test.step("public and protected routes behave correctly", async () => {
		await page.goto("/");
		await expect(
			page.getByRole("heading", { name: "Downwrite" }),
		).toBeVisible();

		await page.goto("/app");
		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

		const response = await context.request.get("/v1/search?q=anything");
		expect(response.status()).toBe(401);
	});

	await test.step("user can sign up and land in a workspace", async () => {
		await page.goto("/signup");
		await page.getByLabel("Name").fill(user.name);
		await page.getByLabel("Email").fill(user.email);
		await page.getByLabel("Password").fill(user.password);
		await page.getByRole("button", { name: "Create account" }).click();

		await expect(page).toHaveURL(/\/app$/);
		await expect(
			page.getByRole("heading", { name: "Workspace" }),
		).toBeVisible();
		await expect(page.getByText(`${user.name} workspace`)).toBeVisible();
	});

	await test.step("user can create, find, and open a document", async () => {
		await page.getByLabel("Title").fill(document.title);
		await page.getByLabel("Slug").fill(document.slug);
		await page.getByLabel("Markdown").fill(document.initial);
		await page.getByRole("button", { name: "Create document" }).click();

		await expect(
			page.getByRole("heading", { name: document.title }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Launch note" }),
		).toBeVisible();
		await expect(page.getByText("This is the first draft.")).toBeVisible();

		await page.getByRole("link", { name: "Workspace" }).click();
		await page.getByPlaceholder("Search documents").fill("first draft");
		await page.keyboard.press("Enter");
		await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
		await expect(page.getByText(document.title)).toBeVisible();
	});

	await test.step("user can add a version and inspect the diff", async () => {
		await page.getByRole("link", { name: document.title }).click();
		await page.locator("textarea[name='content']").fill(document.updated);
		await page.getByRole("button", { name: "Create version" }).click();

		await expect(page.getByRole("link", { name: "v2" })).toBeVisible();
		await expect(
			page.getByText("This is the revised draft with provenance."),
		).toBeVisible();

		await page.getByRole("link", { name: "Diff" }).click();
		await expect(page.getByText("Version 1 to 2")).toBeVisible();
		await expect(page.locator(".diff-row-inserted")).toContainText("beta");
		await expect(page.locator(".diff-row-deleted")).toContainText(
			"first draft",
		);
	});

	await test.step("user can annotate, reply, and view activity", async () => {
		await page.getByRole("link", { name: "Back to document" }).click();
		await page.getByLabel("Quote").fill(document.quote);
		await page.getByLabel("Comment").fill(document.comment);
		await page.getByRole("button", { name: "Annotate" }).click();

		await expect(page.getByText(document.comment)).toBeVisible();
		await page.getByPlaceholder("Reply").fill(document.reply);
		await page.getByRole("button", { name: "Reply" }).click();
		await expect(page.getByText(document.reply)).toBeVisible();

		await page.getByRole("link", { name: "Activity" }).click();
		await expect(page.getByText(`Created ${document.title}`)).toBeVisible();
	});

	await test.step("user can create and open a public share", async () => {
		await page.getByRole("link", { name: "Workspace" }).click();
		await page.getByRole("link", { name: document.title }).click();
		await page.getByRole("button", { name: "Share" }).click();

		const shareLink = page.getByRole("link", { name: "Open share" });
		await expect(shareLink).toBeVisible();
		const href = await shareLink.getAttribute("href");
		expect(href).toMatch(/^\/s\//);

		await page.goto(href ?? "/");
		await expect(page.getByText("Shared document")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: document.title }),
		).toBeVisible();
		await expect(
			page.getByText("This is the revised draft with provenance."),
		).toBeVisible();
	});

	await test.step("user can log out and log back in", async () => {
		await page.goto("/app");
		await page.getByRole("button", { name: "Logout" }).click();
		await expect(
			page.getByRole("heading", { name: "Downwrite" }),
		).toBeVisible();

		await page.getByRole("link", { name: "Login" }).click();
		await page.getByLabel("Email").fill(user.email);
		await page.getByLabel("Password").fill(user.password);
		await page.getByRole("button", { name: "Login" }).click();
		await expect(page).toHaveURL(/\/app$/);
		await expect(page.getByText(document.title)).toBeVisible();
	});
});
