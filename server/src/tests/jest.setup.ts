jest.mock("../socket/socket", () => ({
  getIO: () => ({ to: () => ({ emit: () => {} }) }),
}));
