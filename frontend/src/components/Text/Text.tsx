import type { HTMLAttributes } from "react";

import styles from "./Text.module.css";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly tone?: "muted" | "error" | "eyebrow";
}

export function Text({ tone = "muted", className, ...props }: TextProps) {
  const textClassName = [styles[tone], className].filter(Boolean).join(" ");

  return <p className={textClassName} {...props} />;
}

export function VisuallyHidden({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const textClassName = [styles.visuallyHidden, className].filter(Boolean).join(" ");

  return <span className={textClassName} {...props} />;
}
