import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/"
}));

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "1",
        name: "Test User",
        email: "test@example.com"
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    status: "authenticated"
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("div", props, children);
    },
    span: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("span", props, children);
    },
    button: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("button", props, children);
    },
    section: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("section", props, children);
    },
    article: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("article", props, children);
    },
    nav: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("nav", props, children);
    },
    ul: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("ul", props, children);
    },
    li: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("li", props, children);
    },
    h1: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("h1", props, children);
    },
    h2: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("h2", props, children);
    },
    h3: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("h3", props, children);
    },
    p: ({ children, ...props }: any) => {
      const { createElement } = require("react");
      return createElement("p", props, children);
    }
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}));

// Mock Recharts
vi.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "line-chart" }, children);
  },
  Line: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "line" });
  },
  XAxis: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "x-axis" });
  },
  YAxis: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "y-axis" });
  },
  CartesianGrid: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "cartesian-grid" });
  },
  Tooltip: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "tooltip" });
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "responsive-container" }, children);
  },
  BarChart: ({ children }: { children: React.ReactNode }) => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "bar-chart" }, children);
  },
  Bar: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "bar" });
  },
  PieChart: ({ children }: { children: React.ReactNode }) => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "pie-chart" }, children);
  },
  Pie: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "pie" });
  },
  Cell: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "cell" });
  },
  Legend: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "legend" });
  },
  Brush: () => {
    const { createElement } = require("react");
    return createElement("div", { "data-testid": "brush" });
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.sessionStorage = sessionStorageMock;

// Set test environment variables
process.env.DATABASE_URL =
  "postgres://neondb_owner:npg_PL06dTzliwVn@ep-empty-forest-adg09a8q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret";
