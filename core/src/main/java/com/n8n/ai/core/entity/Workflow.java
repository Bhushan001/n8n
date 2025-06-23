package com.n8n.ai.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workflow extends AuditableBaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId; // Foreign key to User
    private String name;
    private String description;

    @Column(columnDefinition = "jsonb") // For PostgreSQL to store JSON natively
    private String definitionJson; // Stores the workflow structure (nodes, edges, configs) as JSON string
    private boolean isActive;
}
