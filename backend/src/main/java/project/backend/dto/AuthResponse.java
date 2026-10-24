package project.backend.dto;

import lombok.Data;

public record AuthResponse(String accessToken, String refreshToken, UserResponse user) {
}
