import { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'primary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-700',
  primary: 'bg-primary-50 text-primary-700',
};

export default function Badge({ tone = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', toneClasses[tone], className].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}


