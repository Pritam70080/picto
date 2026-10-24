package project.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(int status, String message, String path, LocalDateTime timestamp, Map<String, String> errors) {
}
