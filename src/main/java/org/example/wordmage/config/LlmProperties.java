package org.example.wordmage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "wordmage.llm")
public record LlmProperties(
        String provider,
        String apiKey,
        String model,
        String qwenApiKey,
        String qwenModel
) {
    public boolean hasApiKey() {
        if ("qwen".equalsIgnoreCase(provider)) {
            return qwenApiKey != null && !qwenApiKey.isBlank();
        }
        return apiKey != null && !apiKey.isBlank();
    }
}
