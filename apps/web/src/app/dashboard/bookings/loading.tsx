import { CardSkeleton } from '@/components/ui';

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
