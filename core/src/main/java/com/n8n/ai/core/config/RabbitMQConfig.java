package com.n8n.ai.core.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public Queue workflowQueue() {
        return new Queue("workflow-queue"); // Define the queue name
    }
}
