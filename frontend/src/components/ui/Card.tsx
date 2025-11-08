import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

export default function Card({ header, footer, className = '', children, ...props }: CardProps) {
  return (
    <div className={['card', className].join(' ')} {...props}>
      {header ? <div className="mb-4">{header}</div> : null}
      <div>{children}</div>
      {footer ? <div className="mt-4 pt-4 border-t border-neutral-200">{footer}</div> : null}
    </div>
  );
}


