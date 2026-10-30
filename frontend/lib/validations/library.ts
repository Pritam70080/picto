import { z } from "zod";

export const photoIdsSchema = z.object({
  photoIds: z.array(z.uuid()).min(1, "Select at least one photo"),
});

export const createAlbumSchema = z.object({
  title: z.string().trim().min(1, "Enter an album name").max(255, "Album name is too long"),
});

export const updateAlbumSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  coverPhotoId: z.uuid().nullable().optional(),
});

export const addPhotosToAlbumSchema = photoIdsSchema;

export const createPhotoSchema = z.object({
  imagekitFileId: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  url: z.url(),
  thumbnailUrl: z.url().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().int().nonnegative(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

export const importPhotosSchema = z.object({
  imagekitFileIds: z.array(z.string().trim().min(1)).min(1, "Select at least one asset"),
});

export const aiTransformTypes = [
  "REMOVE_BACKGROUND",
  "BACKGROUND_AND_SHADOW",
  "CHANGE_BACKGROUND",
  "GENERATIVE_FILL",
  "SMART_CROP",
  "OBJECT_CROP",
  "RETOUCH",
  "UPSCALE",
  "AI_EDIT",
] as const;

export const aiTransformSchema = z.object({
  type: z.enum(aiTransformTypes),
  prompt: z.string().trim().max(500).optional(),
  width: z.number().int().positive().max(4096).optional(),
  height: z.number().int().positive().max(4096).optional(),
  focusObject: z.string().trim().max(100).optional(),
});

export const albumTitleSchema = createAlbumSchema.shape.title;
