import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 text-slate-100 backdrop-blur-xl">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-slate-300">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}