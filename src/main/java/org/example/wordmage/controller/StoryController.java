package org.example.wordmage.controller;

import org.example.wordmage.dto.StoryRequest;
import org.example.wordmage.dto.StoryResponse;
import org.example.wordmage.service.StoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping("/story")
    public ResponseEntity<?> generateStory(@RequestBody StoryRequest request) {
        try {
            StoryResponse response = storyService.generateStory(request.words());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "app", "WordMage");
    }
}
