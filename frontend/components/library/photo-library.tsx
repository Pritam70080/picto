"use client";

/* eslint-disable @next/next/no-img-element -- ImageKit hosts are configured by the backend at runtime. */
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Download,
  ImagePlus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type ImageKitAsset, type Photo, type PhotoStatus } from "@/lib/api";
import { libraryKeys, usePhotoActions, usePhotos, useStorageUsage } from "@/hooks/use-library";
import { formatBytes } from "@/lib/utils";
import { useLibraryStore } from "@/stores/library-store";

const pageMeta: Record<PhotoStatus, { title: string; subtitle: string }> = {
  ACTIVE: { title: "Photos", subtitle: "A home for the photos you want to keep close." },
  ARCHIVE: { title: "Archive", subtitle: "Keep special photos tucked away, ready whenever you need them." },
  TRASH: { title: "Trash", subtitle: "Review removed photos and restore anything you want to keep." },
};

function PhotoTile({
  photo,
  selected,
  onSelect,
  onOpen,
}: {
  photo: Photo;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={`group relative aspect-square overflow-hidden rounded-xl bg-muted ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
    >
      <button type="button" className="absolute inset-0 size-full" onClick={onOpen} aria-label={`View ${photo.fileName}`}>
        <img
          src={photo.thumbnailUrl || photo.url}
          alt={photo.fileName}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-label={selected ? `Deselect ${photo.fileName}` : `Select ${photo.fileName}`}
        aria-pressed={selected}
        className={`absolute left-2 top-2 grid size-8 place-items-center rounded-full border border-white/60 bg-black/35 text-white backdrop-blur transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100"}`}
      >
        {selected ? <Check className="size-4" /> : <span className="size-3 rounded-full border border-white" />}
      </button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs font-medium text-white">{photo.fileName}</p>
      </div>
    </motion.article>
  );
}

export function PhotoLibrary({ status }: { status: PhotoStatus }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const photoView = useLibraryStore((state) => state.photoLibraries[status]);
  const { query, page, selectedIds, importOpen, importIds } = photoView;
  const setPhotoQuery = useLibraryStore((state) => state.setPhotoQuery);
  const setPhotoPage = useLibraryStore((state) => state.setPhotoPage);
  const setSelectedPhotoIds = useLibraryStore((state) => state.setSelectedPhotoIds);
  const updateImportOpen = useLibraryStore((state) => state.setImportOpen);
  const updateImportIds = useLibraryStore((state) => state.setImportIds);
  const setQuery = (value: string) => setPhotoQuery(status, value);
  const setPage = (value: number | ((current: number) => number)) => setPhotoPage(status, value);
  const setSelectedIds = (value: string[] | ((current: string[]) => string[])) =>
    setSelectedPhotoIds(status, value);
  const setImportOpen = (value: boolean) => updateImportOpen(status, value);
  const setImportIds = (value: string[] | ((current: string[]) => string[])) =>
    updateImportIds(status, value);
  const fileInput = useRef<HTMLInputElement>(null);
  const { data: photosPage, isLoading, isFetching, error } = usePhotos(status, page);
  const { data: storage } = useStorageUsage();
  const photoActions = usePhotoActions();
  const photos = useMemo(() => photosPage?.content ?? [], [photosPage?.content]);
  const assetsQuery = useQuery({
    queryKey: libraryKeys.assets(),
    queryFn: api.imageKitAssets,
    enabled: importOpen,
  });
  const visiblePhotos = useMemo(
    () => photos.filter((photo) => photo.fileName.toLowerCase().includes(query.trim().toLowerCase())),
    [photos, query],
  );

  const refreshLibrary = async () => {
    await queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    setSelectedIds([]);
  };
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => Promise.all(files.map((file) => api.uploadPhoto(file))),
    onSuccess: async (uploaded) => {
      await refreshLibrary();
      toast.success(`${uploaded.length} ${uploaded.length === 1 ? "photo" : "photos"} uploaded`);
    },
    onError: (uploadError) => toast.error(uploadError.message),
  });
  const importMutation = useMutation({
    mutationFn: api.importAssets,
    onSuccess: async (imported) => {
      await refreshLibrary();
      setImportIds([]);
      setImportOpen(false);
      toast.success(`${imported.length} ${imported.length === 1 ? "photo" : "photos"} imported`);
    },
    onError: (importError) => toast.error(importError.message),
  });
  const addOneMutation = useMutation({
    mutationFn: (asset: ImageKitAsset) =>
      api.createPhoto({
        imagekitFileId: asset.fileId,
        fileName: asset.fileName,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes ?? 0,
        width: asset.width,
        height: asset.height,
      }),
    onSuccess: async () => {
      await refreshLibrary();
      await queryClient.invalidateQueries({ queryKey: libraryKeys.assets() });
      toast.success("Photo added to your library");
    },
    onError: (addError) => toast.error(addError.message),
  });

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };
  const allVisibleSelected =
    visiblePhotos.length > 0 && visiblePhotos.every((photo) => selectedIds.includes(photo.id));
  const toggleAllVisible = () => {
    const visibleIds = new Set(visiblePhotos.map((photo) => photo.id));
    setSelectedIds((ids) =>
      allVisibleSelected
        ? ids.filter((id) => !visibleIds.has(id))
        : [...new Set([...ids, ...visibleIds])],
    );
  };
  const runBulkAction = (action: "archive" | "trash" | "restore" | "delete") => {
    if (!selectedIds.length) return;
    photoActions.mutate({ action, photoIds: selectedIds }, { onSuccess: () => setSelectedIds([]) });
  };

  const heading = pageMeta[status];
  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 space-y-4 pb-4 sm:pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your library</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{heading.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <ImagePlus /> <span className="hidden sm:inline">Import</span>
            </Button>
            {status === "ACTIVE" && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) uploadMutation.mutate(files);
                    event.target.value = "";
                  }}
                />
                <LoadingButton
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                  isLoading={uploadMutation.isPending}
                  aria-label={uploadMutation.isPending ? "Uploading photos" : "Upload photos"}
                  loadingText={<span className="hidden sm:inline">Uploading</span>}
                >
                  <Upload /> <span className="hidden sm:inline">Upload</span>
                </LoadingButton>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:max-w-2xl">
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Search your photos" className="h-10 rounded-full pl-9" />
              {query && (
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setQuery("")} aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllVisible}
              disabled={!visiblePhotos.length || isLoading || photoActions.isPending}
              aria-pressed={allVisibleSelected}
              aria-label={`${allVisibleSelected ? "Deselect" : "Select"} all visible photos`}
            >
              <CheckCheck />
              {allVisibleSelected ? "Deselect all" : "Select all"}
            </Button>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            {storage ? `${storage.libraryPhotoCount} photos · ${formatBytes(storage.libraryUsedBytes)}` : "Library storage"}
          </div>
        </div>

        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2"
            >
              <span className="mr-auto text-sm font-medium">{selectedIds.length} selected</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} disabled={photoActions.isPending}><X /> Clear</Button>
              {status === "ACTIVE" && <LoadingButton variant="outline" size="sm" onClick={() => runBulkAction("archive")} isLoading={photoActions.isPending && photoActions.variables?.action === "archive"} disabled={photoActions.isPending} loadingText="Archiving"><Archive /> Archive</LoadingButton>}
              {status === "ARCHIVE" && <LoadingButton variant="outline" size="sm" onClick={() => runBulkAction("restore")} isLoading={photoActions.isPending && photoActions.variables?.action === "restore"} disabled={photoActions.isPending} loadingText="Restoring"><RotateCcw /> Restore to photos</LoadingButton>}
              {status !== "TRASH" && <LoadingButton variant="outline" size="sm" onClick={() => runBulkAction("trash")} isLoading={photoActions.isPending && photoActions.variables?.action === "trash"} disabled={photoActions.isPending} loadingText="Moving to trash"><Trash2 /> Trash</LoadingButton>}
              {status === "TRASH" && (
                <>
                  <LoadingButton variant="outline" size="sm" onClick={() => runBulkAction("restore")} isLoading={photoActions.isPending && photoActions.variables?.action === "restore"} disabled={photoActions.isPending} loadingText="Restoring"><RotateCcw /> Restore</LoadingButton>
                  <LoadingButton variant="destructive" size="sm" onClick={() => runBulkAction("delete")} isLoading={photoActions.isPending && photoActions.variables?.action === "delete"} disabled={photoActions.isPending} loadingText="Deleting"><Trash2 /> Delete forever</LoadingButton>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="mobile-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => <div key={index} className="aspect-square animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : error ? (
          <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 text-center">
            <p className="font-medium">We couldn&apos;t load your photos.</p>
            <p className="max-w-sm text-sm text-muted-foreground">{error.message}</p>
            <LoadingButton variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: libraryKeys.photos(status) })} isLoading={isFetching} loadingText="Loading photos">Try again</LoadingButton>
          </div>
        ) : visiblePhotos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              <AnimatePresence initial={false}>
                {visiblePhotos.map((photo) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    selected={selectedIds.includes(photo.id)}
                    onSelect={() => toggleSelected(photo.id)}
                    onOpen={() => router.push(`/photos/${encodeURIComponent(photo.id)}?from=${status === "ACTIVE" ? "photos" : status.toLowerCase()}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
            {photosPage && photosPage.totalPages > 1 && (
              <div className="flex items-center justify-between border-t py-3">
                <p className="text-xs text-muted-foreground">Page {photosPage.page + 1} of {photosPage.totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}><ChevronLeft /> Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((current) => current + 1)} disabled={photosPage.last}><span className="hidden sm:inline">Next</span> <ChevronRight /></Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[min(50vh,420px)] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              {status === "TRASH" ? <Trash2 className="size-6" /> : <CloudUpload className="size-6" />}
            </div>
            <h2 className="text-lg font-semibold">{query ? "No matching photos" : status === "TRASH" ? "Trash is empty" : "Your moments start here"}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {query ? "Try a different search." : status === "TRASH" ? "Photos you move to trash will show up here." : "Upload a photo or bring in images already stored in your library."}
            </p>
            {!query && status === "ACTIVE" && (
              <div className="mt-5 flex gap-2">
                <LoadingButton onClick={() => fileInput.current?.click()} isLoading={uploadMutation.isPending} aria-label={uploadMutation.isPending ? "Uploading photos" : "Upload a photo"} loadingText="Uploading"><Upload /> Upload a photo</LoadingButton>
                <Button variant="outline" onClick={() => setImportOpen(true)}><Download /> Import</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) setImportIds([]); }}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import from your image library</DialogTitle>
            <DialogDescription>Choose existing ImageKit images to add to Picto.</DialogDescription>
          </DialogHeader>
          <div className="mobile-scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
            {assetsQuery.isLoading ? (
              <div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />)}</div>
            ) : assetsQuery.error ? (
              <p className="py-8 text-sm text-destructive">{assetsQuery.error.message}</p>
            ) : assetsQuery.data?.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {assetsQuery.data.map((asset) => {
                  const isSelected = importIds.includes(asset.fileId);
                  return (
                    <div key={asset.fileId} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <button
                        type="button"
                        disabled={asset.alreadyImported || addOneMutation.isPending || importMutation.isPending}
                        onClick={() => setImportIds((ids) => isSelected ? ids.filter((id) => id !== asset.fileId) : [...ids, asset.fileId])}
                        aria-label={`${isSelected ? "Deselect" : "Select"} ${asset.fileName}`}
                        aria-pressed={isSelected}
                        className={`absolute inset-0 size-full text-left ring-offset-2 transition ${isSelected ? "ring-2 ring-primary" : ""} disabled:opacity-50`}
                      >
                        <img src={asset.thumbnailUrl || asset.url} alt="" className="size-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 text-xs text-white">{asset.alreadyImported ? "Already imported" : asset.fileName}</span>
                        {isSelected && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}
                      </button>
                      {!asset.alreadyImported && (
                        <LoadingButton
                          size="xs"
                          className="absolute left-2 top-2 z-10 bg-black/50 text-white hover:bg-black/70"
                          onClick={() => addOneMutation.mutate(asset)}
                          isLoading={addOneMutation.isPending && addOneMutation.variables?.fileId === asset.fileId}
                          disabled={importMutation.isPending || addOneMutation.isPending}
                          aria-label={`Add ${asset.fileName} to your library`}
                          loadingText="Adding"
                        >
                          Add one
                        </LoadingButton>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <ImagePlus className="mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">No importable images found</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload a photo to create a library first.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importMutation.isPending || addOneMutation.isPending}>Cancel</Button>
            <LoadingButton onClick={() => importMutation.mutate(importIds)} disabled={!importIds.length || addOneMutation.isPending} isLoading={importMutation.isPending} loadingText="Importing photos"><Download /> Import {importIds.length || ""}</LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
