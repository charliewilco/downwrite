import { expect, test } from "@playwright/test";

test("renders the public home page", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { name: "Downwrite" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Create account" }),
	).toHaveAttribute("href", "/signup");
	await expect(page.getByRole("link", { name: "Login" })).toHaveAttribute(
		"href",
		"/login",
	);
});
