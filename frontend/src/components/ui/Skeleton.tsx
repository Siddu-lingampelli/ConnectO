import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export default function Skeleton({ width = '100%', height = 12, rounded = '0.5rem', className = '', style, ...props }: SkeletonProps) {
  return (
    <div
      className={[
        'bg-neutral-200 animate-pulse',
        className,
      ].join(' ')}
      style={{ width, height, borderRadius: rounded as any, ...(style || {}) }}
      {...props}
    />
  );
}


