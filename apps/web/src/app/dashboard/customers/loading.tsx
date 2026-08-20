import { TableSkeleton } from '@/components/ui';

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
      <TableSkeleton rows={8} />
    </div>
  );
}
