const DashboardLoading = () => {
  return (
    <main className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((column) => (
          <div key={column} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <div className="size-2 animate-pulse rounded-full bg-muted-foreground/40" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-8 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="flex min-h-40 flex-col gap-2 rounded-xl border border-dashed p-3">
              {[0, 1].map((card) => (
                <div
                  key={card}
                  className="h-20 animate-pulse rounded-lg border bg-muted"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default DashboardLoading;
