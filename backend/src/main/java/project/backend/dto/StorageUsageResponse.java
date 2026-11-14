package project.backend.dto;

public record StorageUsageResponse(
        long libraryUsedBytes,
        long libraryPhotoCount,
        Long imagekitBandwidthBytes,
        long imagekitStorageBytes,
        long imagekitStorageQuotaBytes
) {
}
