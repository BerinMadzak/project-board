import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "./test-utils";
import PrivateRoute from "../components/PrivateRoute";
import Login from "../pages/Login";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";

vi.mock("../services/socket", () => ({ initSocket: vi.fn() }));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../store/slices/taskSlice", async () => {
  const actual = await vi.importActual("../store/slices/taskSlice");
  return {
    ...actual,
    getTasks: () => ({ type: "tasks/getTasks/fulfilled", payload: [] }),
  };
});

const mockUser = {
  id: "u1",
  email: "test@example.com",
  username: "testuser",
  role: "MEMBER",
};

const mockProject = {
  id: "p1",
  name: "Test Project",
  description: "A test project",
  color: "#6366f1",
  ownerId: "u1",
  owner: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [],
};

const mockTask = {
  id: "t1",
  title: "Fix the bug",
  description: "It crashes on load",
  status: "TODO",
  priority: "HIGH",
  dueDate: null,
  projectId: "p1",
  assigneeId: null,
  createdById: "u1",
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrivateRoute", () => {
  it("renders children when authenticated", () => {
    renderWithProviders(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            token: "abc123",
            isAuthenticated: true,
            loading: false,
            error: null,
          },
        },
      },
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("does not render children when not authenticated", () => {
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return {
        ...actual,
        Navigate: () => null,
      };
    });

    renderWithProviders(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      {
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          },
        },
      },
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});

describe("Login page", () => {
  it("renders email and password fields", () => {
    renderWithProviders(<Login />);
    expect(
      screen.getByPlaceholderText("email@example.com"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("shows validation error when submitting empty form", async () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("shows loading state while signing in", () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: true,
          error: null,
        },
      },
    });
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("displays error message from Redux state", () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: "Invalid credentials",
        },
      },
    });
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});

describe("ProjectCard", () => {
  it("renders project name and description", () => {
    renderWithProviders(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("A test project")).toBeInTheDocument();
  });

  it("shows task count from Redux store", () => {
    renderWithProviders(<ProjectCard project={mockProject} />, {
      preloadedState: {
        tasks: {
          tasks: [mockTask],
          loading: false,
          updatingId: null,
          error: null,
        },
      },
    });
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });

  it("shows 'No description' when description is empty", () => {
    renderWithProviders(
      <ProjectCard project={{ ...mockProject, description: "" }} />,
    );
    expect(screen.getByText("No description")).toBeInTheDocument();
  });
});

describe("TaskCard", () => {
  it("renders task title and priority", () => {
    renderWithProviders(<TaskCard task={mockTask} projectMembers={[]} />);
    expect(screen.getByText("Fix the bug")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders task description when present", () => {
    renderWithProviders(<TaskCard task={mockTask} projectMembers={[]} />);
    expect(screen.getByText("It crashes on load")).toBeInTheDocument();
  });

  it("shows overdue date in red when task is past due", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const overdueTask = { ...mockTask, dueDate: yesterday };

    renderWithProviders(<TaskCard task={overdueTask} projectMembers={[]} />);
    const dateEl = screen.getByText(
      /yesterday|today|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i,
    );
    expect(dateEl.className).toContain("red");
  });

  it("shows assignee initials when assigned", () => {
    const assignedTask = { ...mockTask, assigneeId: "u1" };
    renderWithProviders(
      <TaskCard task={assignedTask} projectMembers={[mockUser]} />,
    );
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
