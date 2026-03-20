import { test, expect } from "@playwright/test";

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("email@example.com").fill("alice@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test("user can navigate to projects page", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });

 test("user can create a new project", async ({ page }) => {
    await page.goto("/projects");

    await page.getByRole("button", { name: /new project/i }).click();
    await page.getByPlaceholder("e.g. My Website Design").fill("E2E Test Project");
    await page.getByRole("button", { name: /create project/i }).click();

    await expect(page.getByText("E2E Test Project")).toBeVisible();
  });

  test("user can open a project and see the kanban board", async ({ page }) => {
    await page.goto("/projects");

    await page.getByText("Website Redesign").click();
    await expect(page).toHaveURL(/\/projects\/.+/);
    await expect(page.getByText(/to do/i)).toBeVisible();
    await expect(page.getByText(/in progress/i)).toBeVisible();
    await expect(page.getByText(/done/i)).toBeVisible();
  });
});