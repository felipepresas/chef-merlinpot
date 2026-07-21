import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="py-4">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-24" />
            <div className="space-y-px overflow-hidden rounded-2xl border border-ink/5 bg-card">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12 rounded-none" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
