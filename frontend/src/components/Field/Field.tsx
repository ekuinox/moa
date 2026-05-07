import type { HTMLAttributes, ReactNode } from "react";

import styles from "./Field.module.css";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  readonly htmlFor: string;
  readonly label: ReactNode;
}

export function Field({ htmlFor, label, children, className, ...props }: FieldProps) {
  const fieldClassName = [styles.field, className].filter(Boolean).join(" ");

  return (
    <div className={fieldClassName} {...props}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
