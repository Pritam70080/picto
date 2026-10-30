"use client";

/* eslint-disable @next/next/no-img-element -- ImageKit hosts are configured by the backend at runtime. */
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, CheckCheck, FolderPlus, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { api, type Album, type Photo } from "@/lib/api";
import { libraryKeys } from "@/hooks/use-library";
import { albumTitleSchema } from "@/lib/validations/library";
import { useLibraryStore } from "@/stores/library-store";

export function AlbumsLibrary() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const albumView = useLibraryStore((state) => state.albumLibrary);
  const { activeAlbumId, createOpen, addPhotosOpen, selectedPhotoIds } = albumView;
  const setActiveAlbumId = useLibraryStore((state) => state.setActiveAlbumId);
  const setCreateOpen = useLibraryStore((state) => state.setCreateAlbumOpen);
  const setAddPhotosOpen = useLibraryStore((state) => state.setAddAlbumPhotosOpen);
  const updateAlbumSelectedPhotoIds = useLibraryStore((state) => state.setAlbumSelectedPhotoIds);
  const setSelectedPhotoIds = (
    ids: string[] | ((current: string[]) => string[]),
  ) => updateAlbumSelectedPhotoIds(ids);
  const [albumTitle, setAlbumTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [albumPhotoSelection, setAlbumPhotoSelection] = useState<{
    albumId: string | null;
    ids: string[];
  }>({ albumId: null, ids: [] });
  const selectedAlbumPhotoIds =
    albumPhotoSelection.albumId === activeAlbumId ? albumPhotoSelection.ids : [];
  const setSelectedAlbumPhotoIds = (
    update: string[] | ((current: string[]) => string[]),
  ) => {
    setAlbumPhotoSelection((current) => ({
      albumId: activeAlbumId,
      ids:
        typeof update === "function"
          ? update(current.albumId === activeAlbumId ? current.ids : [])
          : update,
    }));
  };
  const albumsQuery = useQuery({ queryKey: libraryKeys.albums(), queryFn: api.albums });
  const albumQuery = useQuery({
    queryKey: libraryKeys.album(activeAlbumId ?? ""),
    queryFn: () => api.album(activeAlbumId ?? ""),
    enabled: !!activeAlbumId,
  });

  useEffect(() => {
    const albumId = new URLSearchParams(window.location.search).get("albumId");
    if (albumId) setActiveAlbumId(albumId);
  }, [setActiveAlbumId]);
  const albumPhotosQuery = useQuery({
    queryKey: libraryKeys.albumPhotos(activeAlbumId ?? ""),
    queryFn: () => api.albumPhotos(activeAlbumId ?? ""),
    enabled: !!activeAlbumId,
  });
  const availablePhotosQuery = useQuery({
    queryKey: libraryKeys.photos("ACTIVE"),
    queryFn: () => api.photos("ACTIVE"),
    enabled: addPhotosOpen,
  });

  const invalidateAlbums = async () => {
    await queryClient.invalidateQueries({ queryKey: libraryKeys.albums() });
    if (activeAlbumId) {
      await queryClient.invalidateQueries({ queryKey: libraryKeys.album(activeAlbumId) });
      await queryClient.invalidateQueries({ queryKey: libraryKeys.albumPhotos(activeAlbumId) });
    }
  };
  const createMutation = useMutation({
    mutationFn: (title: string) => api.createAlbum(title),
    onSuccess: async (album) => {
      await invalidateAlbums();
      setCreateOpen(false);
      setAlbumTitle("");
      setActiveAlbumId(album.id);
      toast.success("Album created");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { title?: string; coverPhotoId?: string | null } }) =>
      api.updateAlbum(id, body),
    onSuccess: async () => {
      await invalidateAlbums();
      toast.success("Album updated");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: api.deleteAlbum,
    onSuccess: async () => {
      setActiveAlbumId(null);
      await invalidateAlbums();
      toast.success("Album deleted");
    },
    onError: (error) => toast.error(error.message),
  });
  const addMutation = useMutation({
    mutationFn: (photoIds: string[]) => api.addPhotosToAlbum(activeAlbumId ?? "", photoIds),
    onSuccess: async () => {
      await invalidateAlbums();
      setSelectedPhotoIds([]);
      setAddPhotosOpen(false);
      toast.success("Photos added to album");
    },
    onError: (error) => toast.error(error.message),
  });
  const removeMutation = useMutation({
    mutationFn: async (photoIds: string[]) => {
      const results = await Promise.allSettled(
        photoIds.map((photoId) => api.removePhotoFromAlbum(activeAlbumId ?? "", photoId)),
      );
      const removedCount = results.filter((result) => result.status === "fulfilled").length;
      const failedCount = results.length - removedCount;
      if (failedCount) {
        throw new Error(
          removedCount
            ? `${removedCount} photos were removed, but ${failedCount} could not be removed.`
            : "Could not remove the selected photos from this album.",
        );
      }
    },
    onSuccess: (_, photoIds) => {
      setSelectedAlbumPhotoIds([]);
      toast.success(
        `${photoIds.length === 1 ? "Photo removed" : `${photoIds.length} photos removed`} from this album. ${photoIds.length === 1 ? "It is" : "They are"} still in your library.`,
      );
    },
    onError: (error) => {
      setSelectedAlbumPhotoIds([]);
      toast.error(error.message);
    },
    onSettled: async () => {
      await invalidateAlbums();
    },
  });
  const albums = albumsQuery.data ?? [];
  const album = albumQuery.data ?? albums.find((item) => item.id === activeAlbumId) ?? null;
  const photos = useMemo(() => albumPhotosQuery.data?.content ?? [], [albumPhotosQuery.data?.content]);
  const availablePhotos = useMemo(
    () => (availablePhotosQuery.data?.content ?? []).filter((photo) => !photos.some((inAlbum) => inAlbum.id === photo.id)),
    [availablePhotosQuery.data?.content, photos],
  );
  const allAlbumPhotosSelected =
    photos.length > 0 && photos.every((photo) => selectedAlbumPhotoIds.includes(photo.id));
  const allAvailablePhotosSelected =
    availablePhotos.length > 0 &&
    availablePhotos.every((photo) => selectedPhotoIds.includes(photo.id));
  const toggleAllAlbumPhotos = () => {
    const photoIds = new Set(photos.map((photo) => photo.id));
    setSelectedAlbumPhotoIds((ids) =>
      allAlbumPhotosSelected
        ? ids.filter((id) => !photoIds.has(id))
        : [...new Set([...ids, ...photoIds])],
    );
  };
  const toggleAllAvailablePhotos = () => {
    const photoIds = new Set(availablePhotos.map((photo) => photo.id));
    setSelectedPhotoIds((ids) =>
      allAvailablePhotosSelected
        ? ids.filter((id) => !photoIds.has(id))
        : [...new Set([...ids, ...photoIds])],
    );
  };

  const submitTitle = () => {
    const result = albumTitleSchema.safeParse(albumTitle);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Enter a valid album name");
      return;
    }
    createMutation.mutate(result.data);
  };
  const saveTitle = () => {
    const result = albumTitleSchema.safeParse(editingTitle);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Enter a valid album name");
      return;
    }
    if (!activeAlbumId) {
      toast.error("Choose an album to rename");
      return;
    }
    updateMutation.mutate({ id: activeAlbumId, body: { title: result.data } });
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 pb-5">
        <div className="flex min-w-0 items-center gap-3">
          {activeAlbumId && (
            <Button variant="outline" size="icon" aria-label="Back to albums" onClick={() => { setActiveAlbumId(null); router.replace("/albums"); }} disabled={deleteMutation.isPending || addMutation.isPending}>
              <ArrowLeft />
            </Button>
          )}
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your collection</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{album?.title ?? "Albums"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {album ? `${album.photoCount} ${album.photoCount === 1 ? "photo" : "photos"} in this album` : "Bring your favorite photos together in collections made for every occasion."}
            </p>
          </div>
        </div>
        {album ? (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditingTitle(album.title); setCreateOpen(true); }}><Pencil /> <span className="hidden sm:inline">Rename</span></Button>
            <Button size="sm" onClick={() => setAddPhotosOpen(true)}><Plus /> <span className="hidden sm:inline">Add photos</span></Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => { setAlbumTitle(""); setCreateOpen(true); }}><FolderPlus /> New album</Button>
        )}
      </header>

      <div className="mobile-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        {album ? (
          albumPhotosQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-square animate-pulse rounded-xl bg-muted" />)}</div>
          ) : albumPhotosQuery.error ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><p className="font-medium">Couldn&apos;t open this album</p><p className="text-sm text-muted-foreground">{albumPhotosQuery.error.message}</p><LoadingButton variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: libraryKeys.albumPhotos(activeAlbumId ?? "") })} isLoading={albumPhotosQuery.isFetching} loadingText="Loading album">Try again</LoadingButton></div>
          ) : photos.length ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllAlbumPhotos}
                  disabled={removeMutation.isPending || updateMutation.isPending}
                  aria-pressed={allAlbumPhotosSelected}
                >
                  <CheckCheck />
                  {allAlbumPhotosSelected ? "Deselect all" : "Select all"}
                </Button>
                {selectedAlbumPhotoIds.length > 0 && (
                  <>
                    <span className="mr-auto text-sm text-muted-foreground">
                      {selectedAlbumPhotoIds.length} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAlbumPhotoIds([])}
                      disabled={removeMutation.isPending}
                    >
                      Clear
                    </Button>
                    <LoadingButton
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMutation.mutate(selectedAlbumPhotoIds)}
                      isLoading={removeMutation.isPending}
                      disabled={updateMutation.isPending}
                      loadingText="Removing"
                    >
                      <Trash2 /> Remove from album
                    </LoadingButton>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                <AnimatePresence initial={false}>
                  {photos.map((photo) => (
                    <AlbumPhoto
                      key={photo.id}
                      photo={photo}
                      isCover={album.coverPhotoId === photo.id}
                      isSelected={selectedAlbumPhotoIds.includes(photo.id)}
                      isSettingCover={updateMutation.isPending && updateMutation.variables?.body.coverPhotoId === photo.id}
                      isRemoving={removeMutation.isPending && removeMutation.variables?.includes(photo.id)}
                      isActionPending={updateMutation.isPending || removeMutation.isPending}
                      onSelect={() =>
                        setSelectedAlbumPhotoIds((ids) =>
                          ids.includes(photo.id)
                            ? ids.filter((id) => id !== photo.id)
                            : [...ids, photo.id],
                        )
                      }
                      onCover={() => updateMutation.mutate({ id: album.id, body: { coverPhotoId: photo.id } })}
                      onRemove={() => removeMutation.mutate([photo.id])}
                      onView={() => router.push(`/photos/${encodeURIComponent(photo.id)}?from=albums&albumId=${encodeURIComponent(album.id)}`)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex min-h-[min(50vh,420px)] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><ImagePlus className="size-6" /></div>
              <h2 className="text-lg font-semibold">This album is ready for its first photo</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add photos from your library whenever you like.</p>
              <Button className="mt-5" onClick={() => setAddPhotosOpen(true)}><Plus /> Add photos</Button>
            </div>
          )
        ) : albumsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[1.25] animate-pulse rounded-2xl bg-muted" />)}</div>
        ) : albumsQuery.error ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><p className="font-medium">Couldn&apos;t load your albums</p><p className="text-sm text-muted-foreground">{albumsQuery.error.message}</p><LoadingButton variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: libraryKeys.albums() })} isLoading={albumsQuery.isFetching} loadingText="Loading albums">Try again</LoadingButton></div>
        ) : albums.length ? (
          <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence initial={false}>
              {albums.map((item, index) => <AlbumCard key={item.id} album={item} index={index} onClick={() => setActiveAlbumId(item.id)} />)}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex min-h-[min(50vh,420px)] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><FolderPlus className="size-6" /></div>
            <h2 className="text-lg font-semibold">Make a collection of your own</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Group your favorite photos into albums for trips, celebrations, and everyday moments.</p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}><FolderPlus /> Create your first album</Button>
          </div>
        )}
      </div>

      {album && (
        <div className="shrink-0 border-t pt-3">
          <LoadingButton variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(album.id)} isLoading={deleteMutation.isPending} loadingText="Deleting album" disabled={addMutation.isPending || updateMutation.isPending}><Trash2 /> Delete album</LoadingButton>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeAlbumId ? "Rename album" : "Create an album"}</DialogTitle>
            <DialogDescription>Give this collection a name that brings the moment back.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            maxLength={255}
            value={activeAlbumId ? editingTitle : albumTitle}
            onChange={(event) => activeAlbumId ? setEditingTitle(event.target.value) : setAlbumTitle(event.target.value)}
            placeholder="Weekend in the mountains"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (activeAlbumId) saveTitle();
                else submitTitle();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Cancel</Button>
            <LoadingButton onClick={activeAlbumId ? saveTitle : submitTitle} isLoading={createMutation.isPending || updateMutation.isPending} loadingText={activeAlbumId ? "Saving changes" : "Creating album"}>
              {activeAlbumId ? "Save changes" : "Create album"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addPhotosOpen} onOpenChange={(open) => { setAddPhotosOpen(open); if (!open) setSelectedPhotoIds([]); }}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add photos</DialogTitle>
            <DialogDescription>Choose photos from your library for {album?.title}.</DialogDescription>
          </DialogHeader>
          <div className="mobile-scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
            {availablePhotosQuery.isLoading ? (
              <div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />)}</div>
            ) : availablePhotosQuery.error ? (
              <p className="py-8 text-sm text-destructive">{availablePhotosQuery.error.message}</p>
            ) : availablePhotos.length ? (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedPhotoIds.length} selected
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllAvailablePhotos}
                    disabled={addMutation.isPending}
                    aria-pressed={allAvailablePhotosSelected}
                  >
                    <CheckCheck />
                    {allAvailablePhotosSelected ? "Deselect all" : "Select all"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availablePhotos.map((photo) => {
                    const checked = selectedPhotoIds.includes(photo.id);
                    return <button type="button" key={photo.id} disabled={addMutation.isPending} onClick={() => setSelectedPhotoIds((ids) => checked ? ids.filter((id) => id !== photo.id) : [...ids, photo.id])} aria-label={`${checked ? "Deselect" : "Select"} ${photo.fileName}`} aria-pressed={checked} className={`relative aspect-square overflow-hidden rounded-lg ring-offset-2 ${checked ? "ring-2 ring-primary" : ""} disabled:opacity-50`}><img src={photo.thumbnailUrl || photo.url} alt="" className="size-full object-cover" />{checked && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}</button>;
                  })}
                </div>
              </>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center"><ImagePlus className="mb-3 size-8 text-muted-foreground" /><p className="font-medium">No more photos to add</p><p className="mt-1 text-sm text-muted-foreground">Upload or import photos to your library first.</p></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPhotosOpen(false)} disabled={addMutation.isPending}>Cancel</Button>
            <LoadingButton onClick={() => addMutation.mutate(selectedPhotoIds)} disabled={!selectedPhotoIds.length} isLoading={addMutation.isPending} loadingText="Adding photos">
              Add {selectedPhotoIds.length || ""} photos
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AlbumCard({ album, index, onClick }: { album: Album; index: number; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.035, 0.2), duration: 0.2 }}
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border bg-card text-left transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[1.35] overflow-hidden bg-muted">
        {album.coverThumbnailUrl ? <img src={album.coverThumbnailUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" /> : <div className="grid size-full place-items-center bg-gradient-to-br from-primary/15 via-muted to-accent/20"><ImagePlus className="size-8 text-primary/50" /></div>}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0"><p className="truncate text-sm font-semibold">{album.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}</p></div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary"><ArrowLeft className="size-4 rotate-180" /></span>
      </div>
    </motion.button>
  );
}

function AlbumPhoto({
  photo,
  isCover,
  isSelected,
  isSettingCover,
  isRemoving,
  isActionPending,
  onSelect,
  onCover,
  onRemove,
  onView,
}: {
  photo: Photo;
  isCover: boolean;
  isSelected: boolean;
  isSettingCover: boolean;
  isRemoving: boolean;
  isActionPending: boolean;
  onSelect: () => void;
  onCover: () => void;
  onRemove: () => void;
  onView: () => void;
}) {
  return (
    <motion.article layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className={`group relative aspect-square overflow-hidden rounded-xl bg-muted ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
      <button type="button" onClick={onView} aria-label={`View ${photo.fileName}`} className="absolute inset-0 size-full">
        <img src={photo.thumbnailUrl || photo.url} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        disabled={isActionPending}
        aria-label={`${isSelected ? "Deselect" : "Select"} ${photo.fileName}`}
        aria-pressed={isSelected}
        className="absolute left-2 top-2 z-10 grid size-8 place-items-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur disabled:opacity-50"
      >
        {isSelected ? <Check className="size-4" /> : <span className="size-3 rounded-full border border-white" />}
      </button>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-8 opacity-100 transition-all sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <LoadingButton size="xs" variant="secondary" onClick={onCover} disabled={isCover || isActionPending} isLoading={isSettingCover} aria-label={isCover ? "Current album cover" : `Set ${photo.fileName} as album cover`} loadingText="Setting cover">{isCover ? <><Check /> Cover</> : "Set cover"}</LoadingButton>
        <LoadingButton size="icon-xs" variant="destructive" onClick={onRemove} disabled={isActionPending} isLoading={isRemoving} aria-label={`Remove ${photo.fileName} from album`}>
          <Trash2 />
          <span className="sr-only">Remove from album. The photo stays in your library.</span>
        </LoadingButton>
      </div>
      {isCover && <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white">Cover</span>}
    </motion.article>
  );
}
