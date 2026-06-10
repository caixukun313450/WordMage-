package org.example.wordmage;

import org.example.wordmage.config.LlmProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(LlmProperties.class)
public class WordMageApplication {

    public static void main(String[] args) {
        SpringApplication.run(WordMageApplication.class, args);
    }

}
