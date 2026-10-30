import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import {
  addPhotosToAlbumSchema,
  aiTransformSchema,
  createAlbumSchema,
  createPhotoSchema,
  importPhotosSchema,
  photoIdsSchema,
  updateAlbumSchema,
} from "@/lib/validations/library";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type PhotoStatus = "ACTIVE" | "ARCHIVE" | "TRASH";
export type AiTransformType =
  | "REMOVE_BACKGROUND"
  | "BACKGROUND_AND_SHADOW"
  | "CHANGE_BACKGROUND"
  | "GENERATIVE_FILL"
  | "SMART_CROP"
  | "OBJECT_CROP"
  | "RETOUCH"
  | "UPSCALE"
  | "AI_EDIT";

export type Photo = {
  id: string;
  imagekitFileId: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  status: PhotoStatus;
  createdAt: string;
  deletedAt: string | null;
  parentPhotoId: string | null;
  aiTransformType: AiTransformType | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type Album = {
  id: string;
  title: string;
  coverPhotoId: string | null;
  coverThumbnailUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ImageKitAsset = {
  fileId: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  alreadyImported: boolean;
};

export type StorageUsage = {
  libraryUsedBytes: number;
  libraryPhotoCount: number;
  imagekitBandwidthBytes: number | null;
  imagekitStorageBytes: number | null;
};

export type AiTransformPreview = {
  previewUrl: string;
  type: AiTransformType;
  transformChain: string;
};

let refreshRequest: Promise<AuthResponse | null> | null = null;

async function refreshSession() {
  if (!refreshRequest) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return null;

    refreshRequest = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          useAuthStore.getState().clearAuth();
          return null;
        }
        const auth = (await response.json()) as AuthResponse;
        useAuthStore.getState().setAuth(auth);
        return auth;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  retried = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && auth && !retried) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, options, auth, true);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const json = (value: unknown) => JSON.stringify(value);
const encoded = (value: string) => encodeURIComponent(value);
const validate = <T>(schema: z.ZodType<T>, value: unknown) => schema.parse(value);

export const api = {
  signup: (body: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: json(body) }, false),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: json(body) }, false),
  refresh: (refreshToken: string) =>
    request<AuthResponse>("/auth/refresh", { method: "POST", body: json({ refreshToken }) }, false),
  logout: () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    return request<void>(
      "/auth/logout",
      { method: "POST", body: json(refreshToken ? { refreshToken } : {}) },
      false,
    );
  },
  me: () => request<User>("/auth/me"),

  photos: (status: PhotoStatus, page = 0, size = 60) =>
    request<PageResponse<Photo>>(`/photos?status=${status}&page=${page}&size=${size}`),
  photo: (id: string) => request<Photo>(`/photos/${encoded(id)}`),
  uploadPhoto: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<Photo>("/photos/upload", { method: "POST", body });
  },
  createPhoto: (body: unknown) =>
    request<Photo>("/photos", {
      method: "POST",
      body: json(validate(createPhotoSchema, body)),
    }),
  archivePhotos: (photoIds: string[]) =>
    request<void>("/photos/archive", {
      method: "POST",
      body: json(validate(photoIdsSchema, { photoIds })),
    }),
  trashPhotos: (photoIds: string[]) =>
    request<void>("/photos/trash", {
      method: "POST",
      body: json(validate(photoIdsSchema, { photoIds })),
    }),
  restorePhotos: (photoIds: string[]) =>
    request<void>("/photos/restore", {
      method: "POST",
      body: json(validate(photoIdsSchema, { photoIds })),
    }),
  permanentlyDeletePhotos: (photoIds: string[]) =>
    request<void>("/photos/delete-permanent", {
      method: "POST",
      body: json(validate(photoIdsSchema, { photoIds })),
    }),
  deletePhoto: (id: string) =>
    request<void>(`/photos/${encoded(id)}`, { method: "DELETE" }),

  albums: () => request<Album[]>("/albums"),
  createAlbum: (title: string) =>
    request<Album>("/albums", {
      method: "POST",
      body: json(validate(createAlbumSchema, { title })),
    }),
  album: (id: string) => request<Album>(`/albums/${encoded(id)}`),
  albumPhotos: (id: string, page = 0, size = 60) =>
    request<PageResponse<Photo>>(`/albums/${encoded(id)}/photos?page=${page}&size=${size}`),
  updateAlbum: (id: string, body: unknown) =>
    request<Album>(`/albums/${encoded(id)}`, {
      method: "PATCH",
      body: json(validate(updateAlbumSchema, body)),
    }),
  deleteAlbum: (id: string) =>
    request<void>(`/albums/${encoded(id)}`, { method: "DELETE" }),
  addPhotosToAlbum: (id: string, photoIds: string[]) =>
    request<void>(`/albums/${encoded(id)}/photos`, {
      method: "POST",
      body: json(validate(addPhotosToAlbumSchema, { photoIds })),
    }),
  removePhotoFromAlbum: (id: string, photoId: string) =>
    request<void>(`/albums/${encoded(id)}/photos/${encoded(photoId)}`, { method: "DELETE" }),

  storage: () => request<StorageUsage>("/library/storage"),
  imageKitAssets: () => request<ImageKitAsset[]>("/library/imagekit-assets"),
  importAssets: (imagekitFileIds: string[]) =>
    request<Photo[]>("/library/import", {
      method: "POST",
      body: json(validate(importPhotosSchema, { imagekitFileIds })),
    }),

  previewAiTransform: (photoId: string, body: unknown) =>
    request<AiTransformPreview>(`/photos/${encoded(photoId)}/ai/preview`, {
      method: "POST",
      body: json(validate(aiTransformSchema, body)),
    }),
  applyAiTransform: (photoId: string, body: unknown) =>
    request<Photo>(`/photos/${encoded(photoId)}/ai/apply`, {
      method: "POST",
      body: json(validate(aiTransformSchema, body)),
    }),
};
