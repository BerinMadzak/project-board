module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["./src/tests/setup.ts"],
  setupFilesAfterEnv: ["./src/tests/jest.setup.ts"],
  globalTeardown: "./src/tests/teardown.ts",
};
