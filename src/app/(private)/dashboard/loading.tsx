import { Skeleton } from "@/components/shadcnui/skeleton";

const DashboardLoading = () => {
  return (
    <main className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((column) => (
          <div key={column} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>
            <div className="flex min-h-40 flex-col gap-2 rounded-xl border border-dashed p-3">
              {[0, 1].map((card) => (
                <Skeleton key={card} className="h-20 rounded-lg border" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default DashboardLoading;
