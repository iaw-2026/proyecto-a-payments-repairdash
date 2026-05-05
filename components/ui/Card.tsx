import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">{children}</section>;
}