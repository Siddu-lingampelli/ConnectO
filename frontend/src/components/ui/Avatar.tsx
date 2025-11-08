import { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: number;
}

export default function Avatar({ name, src, size = 36, className = '', ...props }: AvatarProps) {
  const initials = (name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const style = { width: size, height: size } as const;
  return src ? (
    <img
      src={src}
      alt={name || 'Avatar'}
      style={style}
      className={["rounded-full object-cover", className].join(' ')}
      {...props}
    />
  ) : (
    <div
      style={style}
      className={[
        'rounded-full bg-neutral-200 text-neutral-700 inline-flex items-center justify-center font-semibold',
        className,
      ].join(' ')}
      {...props}
    >
      {initials || '?'}
    </div>
  );
}


