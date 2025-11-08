import Badge from './Badge';

export default function VerifiedBadge() {
  return (
    <Badge tone="primary" className="inline-flex items-center gap-1">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.5 4.5l9 0A2.5 2.5 0 0119 7v9.5a2.5 2.5 0 01-2.5 2.5H7.5A2.5 2.5 0 015 16.5V7A2.5 2.5 0 017.5 4.5z" />
      </svg>
      Verified
    </Badge>
  );
}


