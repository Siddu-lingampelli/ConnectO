import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import Avatar from './Avatar';

export interface JobCardProps {
  id: string;
  title: string;
  budget?: string;
  location?: string;
  tags?: string[];
  clientName?: string;
  clientAvatar?: string;
  onView?: (id: string) => void;
}

export default function JobCard({ id, title, budget, location, tags = [], clientName, clientAvatar, onView }: JobCardProps) {
  return (
    <Card className="hover-elevate">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate">{title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            {budget ? <span>{budget}</span> : null}
            {location ? (
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0c-4.418 0-8 3.134-8 7v2h16v-2c0-3.866-3.582-7-8-7z" />
                </svg>
                {location}
              </span>
            ) : null}
          </div>
          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {clientName ? <Avatar name={clientName} src={clientAvatar} /> : null}
          {onView ? (
            <Button variant="ghost" onClick={() => onView(id)}>
              View
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}


