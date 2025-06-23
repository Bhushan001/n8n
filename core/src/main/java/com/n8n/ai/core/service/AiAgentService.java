package com.n8n.ai.core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.n8n.ai.core.entity.AiAgentConfig;
import com.n8n.ai.core.repository.AiAgentConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
@Service
public class AiAgentService {

    private final AiAgentConfigRepository aiAgentConfigRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}") // Get API key from application.properties
    private String geminiApiKey;

    // Modified constructor to accept RestClient.Builder
    public AiAgentService(AiAgentConfigRepository aiAgentConfigRepository,
                          RestClient.Builder restClientBuilder, // Inject the builder
                          ObjectMapper objectMapper) {
        this.aiAgentConfigRepository = aiAgentConfigRepository;
        this.restClient = restClientBuilder.build(); // Build the RestClient from the builder
        this.objectMapper = objectMapper;
    }

    public Optional<AiAgentConfig> findAiAgentConfigById(Long id) {
        return aiAgentConfigRepository.findById(id);
    }

    // This method is called by the Workflow Execution Engine
    public String executeAiAgent(Long agentConfigId, String prompt, Map<String, Object> additionalConfig) throws Exception {
        AiAgentConfig config = aiAgentConfigRepository.findById(agentConfigId)
                .orElseThrow(() -> new RuntimeException("AI Agent configuration not found."));

        String agentType = config.getType();
        String storedConfigJson = config.getConfigJson(); // Model specific configs from DB
        JsonNode storedConfigNode = objectMapper.readTree(storedConfigJson);

        // Merge runtime config with stored config
        Map<String, Object> mergedConfig = new HashMap<>();
        if (storedConfigNode.isObject()) {
            storedConfigNode.fields().forEachRemaining(entry -> mergedConfig.put(entry.getKey(), entry.getValue()));
        }
        if (additionalConfig != null) {
            mergedConfig.putAll(additionalConfig);
        }

        switch (agentType) {
            case "gemini":
                return callGeminiApi(prompt, config.getApiKey() != null ? config.getApiKey() : geminiApiKey, mergedConfig);
            // case "openai":
            //     return callOpenAIApi(prompt, config.getApiKey(), mergedConfig);
            default:
                throw new IllegalArgumentException("Unsupported AI agent type: " + agentType);
        }
    }

    private String callGeminiApi(String prompt, String apiKey, Map<String, Object> config) throws Exception {
        String model = (String) config.getOrDefault("model", "gemini-2.0-flash");
        Double temperature = ((JsonNode) config.getOrDefault("temperature", objectMapper.getNodeFactory().numberNode(0.7))).asDouble();
        Integer maxOutputTokens = ((JsonNode) config.getOrDefault("maxOutputTokens", objectMapper.getNodeFactory().numberNode(1000))).asInt();

        // Construct Gemini API payload
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        content.put("parts", List.of(Map.of("text", prompt)));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", temperature);
        generationConfig.put("maxOutputTokens", maxOutputTokens);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(content));
        payload.put("generationConfig", generationConfig);

        String jsonPayload = objectMapper.writeValueAsString(payload);

        String apiUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

        // Make the API call
        String responseBody = restClient.post()
                .uri(apiUrl)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(jsonPayload)
                .retrieve()
                .body(String.class);

        // Parse response and extract generated text
        JsonNode rootNode = objectMapper.readTree(responseBody);
        if (rootNode.has("candidates") && rootNode.get("candidates").isArray() && rootNode.get("candidates").get(0).has("content") && rootNode.get("candidates").get(0).get("content").has("parts") && rootNode.get("candidates").get(0).get("content").get("parts").isArray()) {
            return rootNode.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
        } else {
            throw new RuntimeException("Unexpected Gemini API response structure: " + responseBody);
        }
    }

    // Add methods for other AI APIs (e.g., callOpenAIApi, callAzureOpenAIApi)
}