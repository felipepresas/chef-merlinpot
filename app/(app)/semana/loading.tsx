import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="py-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <Skeleton className="mb-4 h-12 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink/5 bg-white p-4">
            <Skeleton className="mb-3 h-4 w-20" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
