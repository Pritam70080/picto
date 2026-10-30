import { PhotoDetail } from "@/components/library/photo-detail";

type PhotoPageProps = {
  params: Promise<{ photoId: string }>;
  searchParams: Promise<{ from?: string | string[]; albumId?: string | string[] }>;
};

const returnLocations = ["photos", "archive", "trash", "albums"] as const;

export default async function PhotoPage({ params, searchParams }: PhotoPageProps) {
  const [{ photoId }, query] = await Promise.all([params, searchParams]);
  const requestedLocation = Array.isArray(query.from) ? query.from[0] : query.from;
  const returnFrom = returnLocations.find((location) => location === requestedLocation) ?? "photos";
  const albumId = Array.isArray(query.albumId) ? query.albumId[0] : query.albumId;

  return <PhotoDetail photoId={photoId} returnFrom={returnFrom} albumId={albumId} />;
}
