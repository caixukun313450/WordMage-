package org.example.wordmage.service;

import org.example.wordmage.config.LlmProperties;
import org.example.wordmage.dto.StoryResponse;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@EnableConfigurationProperties(LlmProperties.class)
public class StoryService {

    private static final Pattern JSON_BLOCK = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```");

    private final LlmProperties llmProperties;
    private final RestClient restClient;

    public StoryService(LlmProperties llmProperties) {
        this.llmProperties = llmProperties;
        this.restClient = RestClient.create();
    }

    public StoryResponse generateStory(List<String> words) {
        if (words == null || words.isEmpty()) {
            throw new IllegalArgumentException("请至少输入 1 个单词");
        }
        if (words.size() > 5) {
            throw new IllegalArgumentException("最多输入 5 个单词");
        }

        if (!llmProperties.hasApiKey()) {
            return buildDemoStory(words);
        }

        try {
            String content = callLlm(words);
            return parseLlmResponse(content, words);
        } catch (Exception e) {
            StoryResponse demo = buildDemoStory(words);
            return new StoryResponse(
                    demo.title() + "（演示）",
                    demo.storyEn(),
                    demo.storyZh(),
                    words,
                    true
            );
        }
    }

    private String callLlm(List<String> words) {
        String wordList = String.join(", ", words);
        String prompt = """
                你是一位面向中国小学 3-6 年级学生的英语教师。请根据以下英文单词创作一个简短、有趣、积极正面的英文小故事（80-120 词），并在故事中自然使用这些单词。
                单词：%s

                请严格以 JSON 格式回复，不要包含其他文字：
                {
                  "title": "英文标题",
                  "storyEn": "英文故事正文",
                  "storyZh": "故事的中文翻译"
                }
                """.formatted(wordList);

        if ("qwen".equalsIgnoreCase(llmProperties.provider())) {
            return callQwen(prompt);
        }
        return callZhipu(prompt);
    }

    private String callZhipu(String prompt) {
        Map<String, Object> body = Map.of(
                "model", llmProperties.model(),
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.7
        );

        Map<?, ?> response = restClient.post()
                .uri("https://open.bigmodel.cn/api/paas/v4/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + llmProperties.apiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        return extractContent(response);
    }

    private String callQwen(String prompt) {
        Map<String, Object> body = Map.of(
                "model", llmProperties.qwenModel(),
                "input", Map.of("messages", List.of(Map.of("role", "user", "content", prompt))),
                "parameters", Map.of("result_format", "message")
        );

        Map<?, ?> response = restClient.post()
                .uri("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + llmProperties.qwenApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        return extractQwenContent(response);
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<?, ?> response) {
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    @SuppressWarnings("unchecked")
    private String extractQwenContent(Map<?, ?> response) {
        Map<String, Object> output = (Map<String, Object>) response.get("output");
        List<Map<String, Object>> choices = (List<Map<String, Object>>) output.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    private StoryResponse parseLlmResponse(String content, List<String> words) {
        String json = content.trim();
        Matcher matcher = JSON_BLOCK.matcher(json);
        if (matcher.find()) {
            json = matcher.group(1).trim();
        }

        String title = extractJsonField(json, "title");
        String storyEn = extractJsonField(json, "storyEn");
        String storyZh = extractJsonField(json, "storyZh");

        if (title.isBlank() || storyEn.isBlank()) {
            throw new IllegalStateException("LLM 返回格式无效");
        }

        return new StoryResponse(title, storyEn, storyZh, words, false);
    }

    private String extractJsonField(String json, String field) {
        Pattern p = Pattern.compile("\"" + field + "\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
        Matcher m = p.matcher(json);
        if (m.find()) {
            return unescapeJson(m.group(1));
        }
        return "";
    }

    private String unescapeJson(String s) {
        return s.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private StoryResponse buildDemoStory(List<String> words) {
        String joined = String.join(", ", words);
        String title = "A Magic Day with " + capitalize(words.get(0));
        String storyEn = """
                Once upon a sunny morning, Lily opened her magic book. \
                She wanted to learn about %s. \
                She walked to the park and saw many friends playing happily. \
                A kind teacher smiled and said, "Every word is a little key to a big world!" \
                Lily practiced each word aloud and felt proud. \
                At sunset, she wrote the words in her notebook and dreamed of tomorrow's adventure. \
                Learning English can be fun when you use words in a story!
                """.formatted(joined);
        String storyZh = """
                在一个阳光明媚的早晨，莉莉打开了她的魔法书。\
                她想学习关于 %s 的知识。\
                她走到公园，看见许多朋友快乐地玩耍。\
                一位和蔼的老师微笑着说："每个单词都是通往大世界的小钥匙！"\
                莉莉大声练习每个单词，感到非常自豪。\
                日落时分，她把单词写进笔记本，憧憬着明天的冒险。\
                当你把单词放进故事里，学英语也可以很有趣！
                """.formatted(joined);

        return new StoryResponse(title, storyEn, storyZh, words, true);
    }

    private String capitalize(String word) {
        if (word == null || word.isEmpty()) {
            return word;
        }
        return Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase();
    }
}
