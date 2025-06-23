package com.n8n.ai.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "ai_agent_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiAgentConfig extends AuditableBaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId; // Foreign key to User
    private String name;
    private String type; // e.g., "gemini", "openai"
    private String apiKey; // **Store encrypted or retrieve securely from Vault/Env**

    @Column(columnDefinition = "jsonb")
    private String configJson; // Stores AI model-specific parameters (e.g., default model, temperature) as JSON string
}
