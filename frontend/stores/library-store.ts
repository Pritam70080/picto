import { create } from "zustand";
import type { AiTransformType, PhotoStatus } from "@/lib/api";

type StateUpdate<T> = T | ((current: T) => T);

type PhotoLibraryState = {
  query: string;
  page: number;
  selectedIds: string[];
  importOpen: boolean;
  importIds: string[];
  transformType: AiTransformType;
  prompt: string;
  previewUrl: string | null;
};

type AlbumLibraryState = {
  activeAlbumId: string | null;
  createOpen: boolean;
  addPhotosOpen: boolean;
  selectedPhotoIds: string[];
};

type LibraryState = {
  photoLibraries: Record<PhotoStatus, PhotoLibraryState>;
  albumLibrary: AlbumLibraryState;
  setPhotoQuery: (status: PhotoStatus, query: string) => void;
  setPhotoPage: (status: PhotoStatus, page: StateUpdate<number>) => void;
  setSelectedPhotoIds: (status: PhotoStatus, ids: StateUpdate<string[]>) => void;
  setImportOpen: (status: PhotoStatus, open: boolean) => void;
  setImportIds: (status: PhotoStatus, ids: StateUpdate<string[]>) => void;
  setTransformType: (status: PhotoStatus, type: AiTransformType) => void;
  setPrompt: (status: PhotoStatus, prompt: string) => void;
  setPreviewUrl: (status: PhotoStatus, url: string | null) => void;
  setActiveAlbumId: (id: string | null) => void;
  setCreateAlbumOpen: (open: boolean) => void;
  setAddAlbumPhotosOpen: (open: boolean) => void;
  setAlbumSelectedPhotoIds: (ids: StateUpdate<string[]>) => void;
};

const createPhotoLibraryState = (): PhotoLibraryState => ({
  query: "",
  page: 0,
  selectedIds: [],
  importOpen: false,
  importIds: [],
  transformType: "AI_EDIT",
  prompt: "",
  previewUrl: null,
});

function resolveUpdate<T>(current: T, update: StateUpdate<T>): T {
  return typeof update === "function"
    ? (update as (value: T) => T)(current)
    : update;
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  photoLibraries: {
    ACTIVE: createPhotoLibraryState(),
    ARCHIVE: createPhotoLibraryState(),
    TRASH: createPhotoLibraryState(),
  },
  albumLibrary: {
    activeAlbumId: null,
    createOpen: false,
    addPhotosOpen: false,
    selectedPhotoIds: [],
  },
  setPhotoQuery: (status, query) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: { ...state.photoLibraries[status], query, page: 0 },
      },
    })),
  setPhotoPage: (status, page) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: {
          ...state.photoLibraries[status],
          page: resolveUpdate(state.photoLibraries[status].page, page),
        },
      },
    })),
  setSelectedPhotoIds: (status, ids) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: {
          ...state.photoLibraries[status],
          selectedIds: resolveUpdate(state.photoLibraries[status].selectedIds, ids),
        },
      },
    })),
  setImportOpen: (status, importOpen) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: { ...state.photoLibraries[status], importOpen },
      },
    })),
  setImportIds: (status, importIds) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: {
          ...state.photoLibraries[status],
          importIds: resolveUpdate(state.photoLibraries[status].importIds, importIds),
        },
      },
    })),
  setTransformType: (status, transformType) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: { ...state.photoLibraries[status], transformType },
      },
    })),
  setPrompt: (status, prompt) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: { ...state.photoLibraries[status], prompt },
      },
    })),
  setPreviewUrl: (status, previewUrl) =>
    set((state) => ({
      photoLibraries: {
        ...state.photoLibraries,
        [status]: { ...state.photoLibraries[status], previewUrl },
      },
    })),
  setActiveAlbumId: (activeAlbumId) =>
    set((state) => ({
      albumLibrary: { ...state.albumLibrary, activeAlbumId },
    })),
  setCreateAlbumOpen: (createOpen) =>
    set((state) => ({
      albumLibrary: { ...state.albumLibrary, createOpen },
    })),
  setAddAlbumPhotosOpen: (addPhotosOpen) =>
    set((state) => ({
      albumLibrary: { ...state.albumLibrary, addPhotosOpen },
    })),
  setAlbumSelectedPhotoIds: (ids) =>
    set((state) => ({
      albumLibrary: {
        ...state.albumLibrary,
        selectedPhotoIds: resolveUpdate(state.albumLibrary.selectedPhotoIds, ids),
      },
    })),
}));
