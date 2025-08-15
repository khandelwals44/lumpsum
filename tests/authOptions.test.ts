import { describe, it, expect } from "vitest";

// Import the authOptions to test its callbacks behavior
import { authOptions } from "@/lib/auth";

// Helper to extract callbacks with correct typing
const { callbacks } = authOptions;

describe("authOptions callbacks", () => {
  it("jwt callback attaches user.id to token when user is present", async () => {
    // Arrange: seed an initial token without id and a user object with id
    const initialToken: any = { name: "Alice" };
    const user: any = { id: "user_123", email: "alice@example.com" };

    // Act: call jwt callback
    const result = await callbacks!.jwt!({ token: initialToken, user } as any);

    // Assert: token contains id copied from user
    expect(result.id).toBe("user_123");
  });

  it("jwt callback attaches user.role to token when provided", async () => {
    // Arrange: token without id and user with role
    const token: any = {};
    const user: any = { id: "u1", role: "ADMIN" };

    // Act: call jwt callback
    const result = await callbacks!.jwt!({ token, user } as any);

    // Assert: token contains role copied from user
    expect(result.role).toBe("ADMIN");
  });

  it("jwt callback returns token unchanged when no user provided", async () => {
    // Arrange: existing token
    const token: any = { name: "Bob", custom: 1 };

    // Act: call without user
    const result = await callbacks!.jwt!({ token } as any);

    // Assert: unchanged token props remain
    expect(result.name).toBe("Bob");
    expect(result.custom).toBe(1);
  });

  it("session callback attaches token.id and token.role to session.user", async () => {
    // Arrange: token with id and role
    const token: any = { id: "user_999", role: "SUBADMIN" };

    // Session shaped like next-auth Session with user object
    const session: any = { user: { name: "Eve", email: "eve@example.com" } };

    // Act: call session callback
    const result = await callbacks!.session!({ session, token } as any);

    // Assert: user id and role are added onto the session for client consumption
    expect((result.user as any).id).toBe("user_999");
    expect((result.user as any).role).toBe("SUBADMIN");
  });

  it("session callback returns session unchanged if session.user is missing", async () => {
    // Arrange: session without user object
    const session: any = {};
    const token: any = { id: "nope", role: "USER" };

    // Act: call session callback
    const result = await callbacks!.session!({ session, token } as any);

    // Assert
    expect(result).toEqual(session);
  });
});
