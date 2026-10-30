package project.backend.dto;

import jakarta.validation.constraints.NotNull;
import project.backend.entity.AiTransformType;


public record AiTransformRequest(
        @NotNull AiTransformType type,
        String prompt,
        Integer width,
        Integer height,
        String focusObject
) {
}