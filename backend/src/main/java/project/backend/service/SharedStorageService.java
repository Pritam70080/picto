package project.backend.service;

import java.sql.PreparedStatement;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import io.imagekit.models.files.FileUploadResponse;
import project.backend.entity.User;
import project.backend.exception.ResourceConflictException;

@Service
public class SharedStorageService {
    private static final long STORAGE_LOCK_ID = 734091;

    private final JdbcTemplate jdbcTemplate;
    private final ImageKitService imageKitService;
    private final long quotaBytes;

    public SharedStorageService(
            JdbcTemplate jdbcTemplate,
            ImageKitService imageKitService,
            @Value("${imagekit.storage-quota-bytes:3221225472}") long quotaBytes) {
        if (quotaBytes <= 0) {
            throw new IllegalArgumentException("ImageKit storage quota must be greater than zero");
        }

        this.jdbcTemplate = jdbcTemplate;
        this.imageKitService = imageKitService;
        this.quotaBytes = quotaBytes;
    }

    public long getQuotaBytes() {
        return quotaBytes;
    }

    public long getAccountStorageBytes() {
        return imageKitService.getAccountStorageBytes();
    }

    @Transactional
    public FileUploadResponse uploadPhoto(User user, MultipartFile file) {
        lockSharedQuota();
        ensureCapacity(getAccountStorageBytes(), file.getSize(), quotaBytes);
        return imageKitService.uploadPhoto(user, file);
    }

    @Transactional
    public FileUploadResponse uploadBytes(User user, byte[] bytes, String fileName) {
        lockSharedQuota();
        ensureCapacity(getAccountStorageBytes(), bytes.length, quotaBytes);
        return imageKitService.uploadBytes(user, bytes, fileName);
    }

    static void ensureCapacity(long usedBytes, long incomingBytes, long quotaBytes) {
        if (usedBytes < 0 || incomingBytes < 0 || usedBytes > quotaBytes
                || incomingBytes > quotaBytes - usedBytes) {
            throw new ResourceConflictException(
                    "Shared ImageKit storage is full. Delete files or try again after space is freed."
            );
        }
    }

    private void lockSharedQuota() {
        jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {
            try (PreparedStatement statement = connection.prepareStatement("SELECT pg_advisory_xact_lock(?)")) {
                statement.setLong(1, STORAGE_LOCK_ID);
                statement.execute();
            }
            return null;
        });
    }
}
