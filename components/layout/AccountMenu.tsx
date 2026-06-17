"use client";

import { UserButton } from "@clerk/nextjs";

export function AccountMenu() {
  return (
    <UserButton
      showName
      fallback={
        <div className="h-10 w-32 rounded-md border border-border bg-white/5" />
      }
      appearance={{
        elements: {
          userButtonBox:
            "gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-accent/40 hover:bg-white/5",
          userButtonTrigger:
            "focus:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          userButtonAvatarBox: "h-8 w-8",
          userButtonPopoverCard:
            "border border-border bg-white text-slate-950 shadow-2xl",
          userButtonPopoverActionButton__manageAccount: "hidden",
          userButtonPopoverFooter: "hidden",
        },
      }}
    />
  );
}
