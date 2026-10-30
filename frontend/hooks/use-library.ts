"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type PhotoStatus } from "@/lib/api";

export const libraryKeys = {
  all: ["library"] as const,
  photos: (status: PhotoStatus, page = 0, size = 60) => ["library", "photos", status, page, size] as const,
  photo: (id: string) => ["library", "photo", id] as const,
  albums: () => ["library", "albums"] as const,
  album: (id: string) => ["library", "album", id] as const,
  albumPhotos: (id: string) => ["library", "album-photos", id] as const,
  storage: () => ["library", "storage"] as const,
  assets: () => ["library", "assets"] as const,
};

export function usePhotos(status: PhotoStatus, page = 0, size = 60) {
  return useQuery({
    queryKey: libraryKeys.photos(status, page, size),
    queryFn: () => api.photos(status, page, size),
  });
}

export function usePhoto(id: string) {
  return useQuery({
    queryKey: libraryKeys.photo(id),
    queryFn: () => api.photo(id),
    enabled: !!id,
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: libraryKeys.storage(),
    queryFn: api.storage,
    staleTime: 60_000,
  });
}

export function usePhotoActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, photoIds }: { action: "archive" | "trash" | "restore" | "delete"; photoIds: string[] }) => {
      if (action === "archive") return api.archivePhotos(photoIds);
      if (action === "trash") return api.trashPhotos(photoIds);
      if (action === "restore") return api.restorePhotos(photoIds);
      return api.permanentlyDeletePhotos(photoIds);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: libraryKeys.all });
      toast.success(
        variables.action === "delete"
          ? "Photos permanently deleted"
          : variables.action === "trash"
            ? "Moved to trash"
            : variables.action === "restore"
              ? "Photos restored"
              : "Photos archived",
      );
    },
    onError: (error) => toast.error(error.message),
  });
}
