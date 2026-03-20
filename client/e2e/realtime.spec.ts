import { test, expect, chromium } from "@playwright/test";

test.describe("Real-time collaboration", () => {
  async function loginAs(page: any, email: string) {
    await page.goto("http://localhost:5173/login");
    await page.getByPlaceholder("email@example.com").fill(email);
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/home/);
  }

  async function createTask(page: any, title: string) {
    await page.getByRole("button", { name: /add task/i }).click();
    await page.getByPlaceholder("New Task").fill(title);
    await page.getByRole("button", { name: /create task/i }).click();
  }

  test("task created by one user appears for another user in real time", async () => {
    const browser = await chromium.launch();
    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();

    await loginAs(alicePage, "alice@example.com");
    await loginAs(bobPage, "bob@example.com");

    await alicePage.goto("http://localhost:5173/projects");
    await alicePage.getByText("Website Redesign").click();
    await expect(alicePage).toHaveURL(/\/projects\/.+/);
    await expect(alicePage.getByText("To Do")).toBeVisible();

    const projectUrl = alicePage.url();
    await bobPage.goto(projectUrl);
    await expect(bobPage.getByText("To Do")).toBeVisible();

    const taskTitle = `Realtime Task ${Date.now()}`;
    await createTask(alicePage, taskTitle);

    await expect(bobPage.getByText(taskTitle)).toBeVisible({ timeout: 10000 });

    await aliceContext.close();
    await bobContext.close();
    await browser.close();
  });

  test("task deleted by one user disappears for another user in real time", async () => {
    const browser = await chromium.launch();
    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();

    await loginAs(alicePage, "alice@example.com");
    await loginAs(bobPage, "bob@example.com");

    await alicePage.goto("http://localhost:5173/projects");
    await alicePage.getByText("Website Redesign").click();
    await expect(alicePage).toHaveURL(/\/projects\/.+/);
    await expect(alicePage.getByText("To Do")).toBeVisible();

    const projectUrl = alicePage.url();
    await bobPage.goto(projectUrl);
    await expect(bobPage.getByText("To Do")).toBeVisible();

    const taskTitle = `Delete Test ${Date.now()}`;
    await createTask(alicePage, taskTitle);

    await expect(alicePage.getByText(taskTitle)).toBeVisible({ timeout: 10000 });
    await expect(bobPage.getByText(taskTitle)).toBeVisible({ timeout: 10000 });

    await alicePage.getByText(taskTitle).hover();
    await alicePage.locator(".group").filter({ hasText: taskTitle })
      .getByRole("button", { name: /delete/i }).click();

    await expect(bobPage.getByText(taskTitle)).not.toBeVisible({ timeout: 10000 });

    await aliceContext.close();
    await bobContext.close();
    await browser.close();
  });
});