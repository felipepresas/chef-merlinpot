import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="py-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-4 h-7 w-2/3" />
      <Skeleton className="mt-2 h-4 w-full" />
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mt-6 aspect-video w-full rounded-2xl" />
      <Skeleton className="mt-8 h-5 w-32" />
      <Skeleton className="mt-3 h-40 w-full rounded-2xl" />
    </div>
  );
}
