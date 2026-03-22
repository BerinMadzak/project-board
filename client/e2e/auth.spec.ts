import { test, expect } from "@playwright/test";
import { randomBytes } from "crypto";

const uniqueEmail = () => `e2e_${randomBytes(4).toString("hex")}@test.com`;
const uniqueUsername = () => `user_${randomBytes(4).toString("hex")}`;

test.describe("Authentication", () => {
  test("user can register and is redirected to home", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Email address").fill(uniqueEmail());
    await page.getByLabel("Username").fill(uniqueUsername());
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test("user can log in with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("email@example.com").fill("alice@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("email@example.com").fill("wrong@example.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("user can log out", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("email@example.com").fill("alice@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/home/);

    await page.getByRole("button", { name: /log out/i }).click();

    await expect(
      page.getByRole("navigation").getByRole("button", { name: /log in/i }),
    ).toBeVisible();
  });
});
