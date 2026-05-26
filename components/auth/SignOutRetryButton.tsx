"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

type SignOutRetryButtonProps = {
  redirectUrl: string;
};

export function SignOutRetryButton({ redirectUrl }: SignOutRetryButtonProps) {
  const { signOut } = useClerk();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      await signOut({ redirectUrl });
    } catch {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-busy={isPending}
      disabled={isPending}
      onClick={handleSignOut}
      className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-hover disabled:cursor-wait disabled:opacity-80"
    >
      {isPending ? "Cerrando sesión..." : "Cerrar sesión y volver a intentar"}
    </button>
  );
}
