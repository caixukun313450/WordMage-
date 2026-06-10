package org.example.wordmage.dto;

import java.util.List;

public record StoryResponse(
        String title,
        String storyEn,
        String storyZh,
        List<String> words,
        boolean demoMode
) {
}
