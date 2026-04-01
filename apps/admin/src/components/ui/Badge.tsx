import clsx from 'clsx';

type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';
type PostStatus = 'DRAFT' | 'PUBLISHED';
type Status = ContactStatus | PostStatus;

const statusStyles: Record<Status, string> = {
  NEW: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  READ: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ARCHIVED: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  DRAFT: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  PUBLISHED: 'bg-green-500/15 text-green-400 border-green-500/30',
};

interface BadgeProps {
  status: Status;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border',
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
