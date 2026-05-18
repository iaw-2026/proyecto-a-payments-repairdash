import type { CSSProperties } from "react";

export function SkeletonBlock({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded bg-surface-elevated/50 animate-pulse ${className}`}
      style={style}
    />
  );
}
