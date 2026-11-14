package project.backend.service;

import org.junit.jupiter.api.Test;

import project.backend.exception.ResourceConflictException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SharedStorageServiceTest {

    @Test
    void allowsAnUploadThatExactlyFillsTheSharedPool() {
        assertDoesNotThrow(() -> SharedStorageService.ensureCapacity(75, 25, 100));
    }

    @Test
    void rejectsAnUploadThatWouldExceedTheSharedPool() {
        assertThrows(
                ResourceConflictException.class,
                () -> SharedStorageService.ensureCapacity(75, 26, 100)
        );
    }

    @Test
    void rejectsUploadsWhenTheAccountIsAlreadyOverQuota() {
        assertThrows(
                ResourceConflictException.class,
                () -> SharedStorageService.ensureCapacity(101, 0, 100)
        );
    }
}
