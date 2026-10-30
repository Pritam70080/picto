"use client";

/* eslint-disable @next/next/no-img-element -- ImageKit hosts are configured by the backend at runtime. */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Archive,
  Check,
  Download,
  Expand,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePhotoActions, usePhoto } from "@/hooks/use-library";
import { api, type AiTransformType } from "@/lib/api";
import { aiTransformTypes } from "@/lib/validations/library";
import { formatBytes } from "@/lib/utils";
import { useLibraryStore } from "@/stores/library-store";

const transformLabels: Record<AiTransformType, string> = {
  REMOVE_BACKGROUND: "Remove background",
  BACKGROUND_AND_SHADOW: "Background + shadow",
  CHANGE_BACKGROUND: "Change background",
  GENERATIVE_FILL: "Generative fill",
  SMART_CROP: "Smart crop",
  OBJECT_CROP: "Object crop",
  RETOUCH: "Retouch",
  UPSCALE: "Upscale",
  AI_EDIT: "AI edit",
};

const photoListPath = {
  photos: "/photos",
  archive: "/archive",
  trash: "/trash",
};

function isPromptRequired(type: AiTransformType) {
  return type === "AI_EDIT" || type === "CHANGE_BACKGROUND";
}

function needsDimensions(type: AiTransformType) {
  return type === "GENERATIVE_FILL" || type === "SMART_CROP";
}

export function PhotoDetail({
  photoId,
  returnFrom,
  albumId,
}: {
  photoId: string;
  returnFrom: "photos" | "archive" | "trash" | "albums";
  albumId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const photoQuery = usePhoto(photoId);
  const photo = photoQuery.data;
  const status = photo?.status ?? "ACTIVE";
  const editorState = useLibraryStore((state) => state.photoLibraries[status]);
  const setTransformType = useLibraryStore((state) => state.setTransformType);
  const setPrompt = useLibraryStore((state) => state.setPrompt);
  const setPreviewUrl = useLibraryStore((state) => state.setPreviewUrl);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [focusObject, setFocusObject] = useState("");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const photoActions = usePhotoActions();

  const returnTo = returnFrom === "albums"
    ? `/albums${albumId ? `?albumId=${encodeURIComponent(albumId)}` : ""}`
    : photoListPath[returnFrom];

  useEffect(() => {
    setPreviewUrl(status, null);
  }, [photoId, setPreviewUrl, status]);

  const previewMutation = useMutation({
    mutationFn: () => {
      if (isPromptRequired(editorState.transformType) && !editorState.prompt.trim()) {
        throw new Error("Add a prompt for this transformation");
      }
      if (editorState.transformType === "OBJECT_CROP" && !focusObject.trim()) {
        throw new Error("Enter the object to focus on");
      }
      return api.previewAiTransform(photoId, {
        type: editorState.transformType,
        prompt: editorState.prompt.trim() || undefined,
        ...(needsDimensions(editorState.transformType) ? dimensions : {}),
        ...(editorState.transformType === "OBJECT_CROP" ? { focusObject } : {}),
      });
    },
    onSuccess: (preview) => setPreviewUrl(status, preview.previewUrl),
    onError: (error) => toast.error(error.message),
  });

  const applyMutation = useMutation({
    mutationFn: () => api.applyAiTransform(photoId, {
      type: editorState.transformType,
      prompt: editorState.prompt.trim() || undefined,
      ...(needsDimensions(editorState.transformType) ? dimensions : {}),
      ...(editorState.transformType === "OBJECT_CROP" ? { focusObject } : {}),
    }),
    onSuccess: async (createdPhoto) => {
      await queryClient.setQueryData(["library", "photo", createdPhoto.id], createdPhoto);
      await queryClient.invalidateQueries({ queryKey: ["library", "photos"] });
      setPreviewUrl(status, null);
      setPrompt(status, "");
      toast.success("Transformed photo saved to your library");
      router.replace(`/photos/${encodeURIComponent(createdPhoto.id)}?from=${returnFrom}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!photo) throw new Error("Photo is not available");
      const response = await fetch(photo.url);
      if (!response.ok) throw new Error(`Image download failed (${response.status})`);
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = photo.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deletePhoto(photoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["library"] });
      toast.success("Photo permanently deleted");
      router.push(returnTo);
    },
    onError: (error) => toast.error(error.message),
  });

  if (photoQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading photo</span>
      </div>
    );
  }

  if (photoQuery.error || !photo) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium">Couldn&apos;t load this photo</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {photoQuery.error?.message ?? "The photo is no longer available."}
        </p>
        <Button variant="outline" onClick={() => router.push(returnTo)}>
          <ArrowLeft /> Back to library
        </Button>
      </div>
    );
  }

  const canPreview =
    (!isPromptRequired(editorState.transformType) || !!editorState.prompt.trim()) &&
    (editorState.transformType !== "OBJECT_CROP" || !!focusObject.trim()) &&
    (!needsDimensions(editorState.transformType) ||
      [dimensions.width, dimensions.height].every(
        (value) => Number.isInteger(value) && value >= 64 && value <= 4096,
      ));
  const isGenerating = previewMutation.isPending;
  const previewUrl = editorState.previewUrl;

  return (
    <section className="mobile-scrollbar-hidden h-full min-h-0 overflow-y-auto overscroll-contain lg:overflow-hidden">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 pb-6 lg:h-full lg:min-h-0 lg:pb-0">
        <header className="flex min-w-0 shrink-0 items-center gap-3">
          <Button variant="outline" size="icon" aria-label="Back" onClick={() => router.push(returnTo)}>
            <ArrowLeft />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold">{photo.fileName}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(photo.createdAt).toLocaleDateString()} · {formatBytes(photo.sizeBytes)}
              {photo.width && photo.height ? ` · ${photo.width} × ${photo.height}` : ""}
            </p>
          </div>
          <LoadingButton
            variant="outline"
            size="sm"
            onClick={() => downloadMutation.mutate()}
            isLoading={downloadMutation.isPending}
            loadingText="Preparing"
          >
            <Download /> <span className="hidden sm:inline">Download</span>
          </LoadingButton>
        </header>

        <div className="grid min-w-0 items-stretch gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
          <div className="mobile-scrollbar-hidden flex min-h-0 flex-col gap-3 overflow-y-auto scrollbar-thin overscroll-contain">
            <div className="relative flex min-h-[min(55vh,620px)] items-center justify-center overflow-hidden rounded-2xl border bg-black lg:min-h-[280px] lg:flex-1">
              <img
                src={previewUrl || photo.url}
                alt={photo.fileName}
                className="size-full max-h-[min(72vh,800px)] object-contain"
              />
              <Button
                variant="secondary"
                size="icon-sm"
                className="absolute right-3 top-3"
                aria-label="View fullscreen"
                onClick={() => setFullscreenOpen(true)}
              >
                <Expand />
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="overflow-hidden rounded-2xl border bg-card p-4"
                  aria-live="polite"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="size-4 animate-pulse text-primary" />
                    Creating your preview…
                  </div>
                  <div className="overflow-hidden">
                    <motion.div
                      className="flex w-max gap-3"
                      animate={{ x: ["0%", "-40%"] }}
                      transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                    >
                      {Array.from({ length: 8 }, (_, index) => (
                        <motion.div
                          key={index}
                          className="aspect-[4/3] w-32 rounded-xl bg-muted"
                          animate={{ opacity: [0.35, 0.8, 0.35] }}
                          transition={{ duration: 1.4, delay: index * 0.08, repeat: Infinity }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              ) : previewUrl ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <figure className="overflow-hidden rounded-xl border bg-card">
                    <img src={photo.url} alt={`Original ${photo.fileName}`} className="aspect-[4/3] w-full object-contain bg-black" />
                    <figcaption className="px-3 py-2 text-xs font-medium text-muted-foreground">Original</figcaption>
                  </figure>
                  <figure className="overflow-hidden rounded-xl border bg-card">
                    <img src={previewUrl} alt={`AI preview of ${photo.fileName}`} className="aspect-[4/3] w-full object-contain bg-black" />
                    <figcaption className="px-3 py-2 text-xs font-medium">Transformation preview</figcaption>
                  </figure>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <aside className="mobile-scrollbar-hidden min-h-0 space-y-4 overflow-y-auto overscroll-contain rounded-2xl border bg-card p-4 sm:p-5">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-primary" /> AI photo transformation
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose an edit, add context, and preview the result before saving.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Choose a transformation</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="AI transformations">
                {aiTransformTypes.map((type) => {
                  const selected = editorState.transformType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setTransformType(status, type);
                        setPreviewUrl(status, null);
                      }}
                      disabled={isGenerating || applyMutation.isPending || status !== "ACTIVE"}
                      className={`min-h-10 rounded-xl border px-2 py-2 text-left text-xs font-medium leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {transformLabels[type]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="transform-prompt" className="text-sm font-medium">
                Prompt{isPromptRequired(editorState.transformType) ? " (required)" : " (optional)"}
              </label>
              <Textarea
                id="transform-prompt"
                value={editorState.prompt}
                onChange={(event) => {
                  setPrompt(status, event.target.value);
                  setPreviewUrl(status, null);
                }}
                placeholder="Describe the changes or details you want…"
                maxLength={500}
                disabled={isGenerating || applyMutation.isPending || status !== "ACTIVE"}
              />
            </div>

            {needsDimensions(editorState.transformType) && (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm font-medium">
                  Width
                  <input
                    type="number"
                    min={64}
                    max={4096}
                    step={1}
                    value={dimensions.width}
                    onChange={(event) => {
                      setDimensions((current) => ({ ...current, width: Number(event.target.value) }));
                      setPreviewUrl(status, null);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3"
                    disabled={isGenerating || applyMutation.isPending || status !== "ACTIVE"}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Height
                  <input
                    type="number"
                    min={64}
                    max={4096}
                    step={1}
                    value={dimensions.height}
                    onChange={(event) => {
                      setDimensions((current) => ({ ...current, height: Number(event.target.value) }));
                      setPreviewUrl(status, null);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3"
                    disabled={isGenerating || applyMutation.isPending || status !== "ACTIVE"}
                  />
                </label>
              </div>
            )}

            {editorState.transformType === "OBJECT_CROP" && (
              <div className="space-y-2">
                <label htmlFor="focus-object" className="text-sm font-medium">Object to focus on</label>
                <input
                  id="focus-object"
                  value={focusObject}
                  onChange={(event) => {
                    setFocusObject(event.target.value);
                    setPreviewUrl(status, null);
                  }}
                  placeholder="For example, person"
                  maxLength={100}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3"
                  disabled={isGenerating || applyMutation.isPending || status !== "ACTIVE"}
                />
              </div>
            )}

            {status !== "ACTIVE" && (
              <p className="text-sm text-muted-foreground">
                Restore this photo to your library before applying AI transformations.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <LoadingButton
                variant="outline"
                onClick={() => previewMutation.mutate()}
                isLoading={isGenerating}
                disabled={!canPreview || status !== "ACTIVE" || applyMutation.isPending}
                loadingText="Generating"
                className="flex-1"
              >
                <Sparkles /> Preview transformation
              </LoadingButton>
              <LoadingButton
                onClick={() => applyMutation.mutate()}
                isLoading={applyMutation.isPending}
                disabled={!previewUrl || status !== "ACTIVE" || isGenerating}
                loadingText="Saving copy"
                className="flex-1"
              >
                <Check /> Save as copy
              </LoadingButton>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-4">
              {status === "ACTIVE" && (
                <LoadingButton
                  variant="outline"
                  size="sm"
                  onClick={() => photoActions.mutate({ action: "archive", photoIds: [photo.id] }, { onSuccess: () => router.push(returnTo) })}
                  isLoading={photoActions.isPending && photoActions.variables?.action === "archive"}
                  disabled={photoActions.isPending || deleteMutation.isPending}
                  loadingText="Archiving"
                >
                  <Archive /> Archive
                </LoadingButton>
              )}
              {status !== "ACTIVE" && (
                <LoadingButton
                  variant="outline"
                  size="sm"
                  onClick={() => photoActions.mutate({ action: "restore", photoIds: [photo.id] }, { onSuccess: () => router.push(returnTo) })}
                  isLoading={photoActions.isPending && photoActions.variables?.action === "restore"}
                  disabled={photoActions.isPending || deleteMutation.isPending}
                  loadingText="Restoring"
                >
                  <RotateCcw /> Restore
                </LoadingButton>
              )}
              {status !== "TRASH" && (
                <LoadingButton
                  variant="outline"
                  size="sm"
                  onClick={() => photoActions.mutate({ action: "trash", photoIds: [photo.id] }, { onSuccess: () => router.push(returnTo) })}
                  isLoading={photoActions.isPending && photoActions.variables?.action === "trash"}
                  disabled={photoActions.isPending || deleteMutation.isPending}
                  loadingText="Moving to trash"
                >
                  <Trash2 /> Move to trash
                </LoadingButton>
              )}
              {status === "TRASH" && (
                <LoadingButton
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  isLoading={deleteMutation.isPending}
                  disabled={photoActions.isPending}
                  loadingText="Deleting"
                >
                  <Trash2 /> Delete permanently
                </LoadingButton>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent showCloseButton={false} className="!fixed !inset-0 !left-0 !top-0 !grid-cols-1 !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 !gap-0 !rounded-none !border-0 !bg-black !p-0 !shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{photo.fileName}</DialogTitle>
            <DialogDescription>Fullscreen photo viewer</DialogDescription>
          </DialogHeader>
          <img
            src={previewUrl || photo.url}
            alt={photo.fileName}
            className="h-full max-h-dvh w-full object-contain"
          />
          <Button
            variant="secondary"
            className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
            onClick={() => downloadMutation.mutate()}
            disabled={downloadMutation.isPending}
          >
            {downloadMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Download />}
            Download image
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="absolute right-4 top-4"
            aria-label="Close fullscreen viewer"
            onClick={() => setFullscreenOpen(false)}
          >
            <X />
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
