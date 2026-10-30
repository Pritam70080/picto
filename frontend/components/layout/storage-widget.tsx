"use client";

import { RotateCcw } from "lucide-react";
import { useStorageUsage } from "@/hooks/use-library";
import { formatBytes } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const STORAGE_QUOTA_BYTES = 3 * 1024 ** 3;

export function StorageWidget() {
  const { data: storage, error, isPending, refetch, isFetching } = useStorageUsage();

  return (
    <section
      aria-label="Storage usage"
      className="mx-3 rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 mb-6"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-sidebar-foreground">Storage</p>
        <span className="text-xs text-muted-foreground">3 GB total</span>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
          <Spinner />
          Loading usage…
        </div>
      ) : error ? (
        <div className="space-y-2">
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
          <div className="mb-2 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium text-sidebar-foreground">
              {formatBytes(storage.libraryUsedBytes)}
              <span className="font-normal text-muted-foreground"> / 3 GB</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Storage used"
            aria-valuemin={0}
            aria-valuemax={STORAGE_QUOTA_BYTES}
            aria-valuenow={Math.min(storage.libraryUsedBytes, STORAGE_QUOTA_BYTES)}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{
                width: `${Math.min(
                  (storage.libraryUsedBytes / STORAGE_QUOTA_BYTES) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Available</span>
            <span className="font-medium text-sidebar-foreground">
              {formatBytes(Math.max(STORAGE_QUOTA_BYTES - storage.libraryUsedBytes, 0))}
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}
