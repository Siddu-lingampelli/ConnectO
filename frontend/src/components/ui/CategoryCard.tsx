import Card from './Card';

interface CategoryCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

export default function CategoryCard({ title, description, onClick }: CategoryCardProps) {
  return (
    <button onClick={onClick} className="text-left w-full">
      <Card className="hover-elevate h-full">
        <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
        {description ? (
          <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{description}</p>
        ) : null}
      </Card>
    </button>
  );
}


