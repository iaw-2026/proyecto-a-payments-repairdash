"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useState } from "react";

type SignOutRetryButtonProps = {
  redirectUrl: string;
};

export function SignOutRetryButton({ redirectUrl }: SignOutRetryButtonProps) {
  const [isPending, setIsPending] = useState(false);

  return (
    <SignOutButton redirectUrl={redirectUrl}>
      <button
        type="button"
        aria-busy={isPending}
        disabled={isPending}
        onClickCapture={() => setIsPending(true)}
        className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-hover disabled:cursor-wait disabled:opacity-80"
      >
        {isPending ? "Cerrando sesión..." : "Cerrar sesión y volver a intentar"}
      </button>
    </SignOutButton>
  );
}
