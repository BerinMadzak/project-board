import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { beforeAll, afterEach, afterAll, vi } from "vitest";

vi.mock("../services/socket", () => ({
  initSocket: vi.fn(),
  getSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
