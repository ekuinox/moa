import type { ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "medium" | "small" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  variant = "secondary",
  size = "medium",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const buttonClassName = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <button className={buttonClassName} type={type} {...props} />;
}
