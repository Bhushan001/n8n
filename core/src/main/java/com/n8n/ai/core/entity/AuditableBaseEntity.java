package com.n8n.ai.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Data
public abstract class AuditableBaseEntity {

    @CreatedBy
    @Column(name = "created_by", nullable = true, updatable = false)
    protected String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = true, updatable = false)
    protected LocalDateTime createdAt;

    @LastModifiedBy
    @Column(name = "last_modified_by", nullable = true)
    protected String lastModifiedBy;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = true)
    protected LocalDateTime updatedAt;
}
