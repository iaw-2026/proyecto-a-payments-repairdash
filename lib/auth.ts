import { auth } from "@clerk/nextjs/server";
import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type UserRole = "rider" | "driver" | "admin";

export type AuthUser = {
  clerkId: string;
  role: UserRole;
};

function isUserRole(role: string): role is UserRole {
  return role === "rider" || role === "driver" || role === "admin";
}

export function isAuthenticated(clerkId: string | null | undefined): boolean {
  return !!clerkId;
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { clerkId: userId },
  });
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();

  if (!user || !isUserRole(user.role)) {
    return null;
  }

  return user.role;
}

export async function getAuthUser(requiredRole?: UserRole): Promise<AuthUser> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("NO_SESSION");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { clerkId: true, role: true },
  });

  if (!user || !isUserRole(user.role)) {
    throw new Error("USER_NOT_FOUND");
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error("FORBIDDEN");
  }

  return {
    clerkId: user.clerkId,
    role: user.role,
  };
}
