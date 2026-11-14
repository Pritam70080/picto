"use client";

import { RotateCcw } from "lucide-react";
import { useStorageUsage } from "@/hooks/use-library";
import { formatBytes } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const NEAR_FULL_THRESHOLD = 0.9;

export function StorageWidget() {
  const { data: storage, error, isPending, refetch, isFetching } = useStorageUsage();
  const usagePercent = storage
    ? Math.min(storage.imagekitStorageBytes / storage.imagekitStorageQuotaBytes, 1)
    : 0;
  const isFull = storage ? storage.imagekitStorageBytes >= storage.imagekitStorageQuotaBytes : false;
  const isNearFull = !isFull && usagePercent >= NEAR_FULL_THRESHOLD;

  return (
    <section
      aria-label="Storage usage"
      className="mx-3 mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-2.5"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-sidebar-foreground">Shared storage</p>
        {storage && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatBytes(storage.imagekitStorageQuotaBytes)} total
          </span>
        )}
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
          <Spinner />
          Loading usage…
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-2">
          <p role="alert" className="text-xs text-destructive">
            Couldn&apos;t load storage usage.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sidebar-foreground hover:text-primary disabled:opacity-50"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RotateCcw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
            Try again
          </button>
        </div>
      ) : storage ? (
        <>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium text-sidebar-foreground">
              {formatBytes(storage.imagekitStorageBytes)}
              <span className="font-normal text-muted-foreground">
                {" "}/ {formatBytes(storage.imagekitStorageQuotaBytes)}
              </span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Storage used"
            aria-valuemin={0}
            aria-valuemax={storage.imagekitStorageQuotaBytes}
            aria-valuenow={Math.min(storage.imagekitStorageBytes, storage.imagekitStorageQuotaBytes)}
            aria-valuetext={`${formatBytes(storage.imagekitStorageBytes)} of ${formatBytes(storage.imagekitStorageQuotaBytes)} used`}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={`h-full rounded-full transition-[width] ${
                isFull ? "bg-destructive" : isNearFull ? "bg-amber-500" : "bg-primary"
              }`}
              style={{
                width: `${usagePercent * 100}%`,
              }}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Available</span>
            <span className="font-medium text-sidebar-foreground">
              {formatBytes(Math.max(storage.imagekitStorageQuotaBytes - storage.imagekitStorageBytes, 0))}
            </span>
          </div>
          {(isFull || isNearFull) && (
            <p className={`mt-1 text-xs ${isFull ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`}>
              {isFull ? "Shared storage is full." : "Shared storage is almost full."}
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}
