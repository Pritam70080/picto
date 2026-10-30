package project.backend.dto;

import project.backend.entity.AiTransformType;

public record AiTransformPreviewResponse(
        String previewUrl,
        AiTransformType type,
        String transformChain
) {
}
