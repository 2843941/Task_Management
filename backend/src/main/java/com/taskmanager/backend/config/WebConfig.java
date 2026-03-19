package com.taskmanager.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5500",
                    "http://127.0.0.1:5500",
                    "http://localhost:5501",
                    "http://127.0.0.1:5501",
                    "http://localhost:8080",
                    "http://127.0.0.1:8080"
                )
                .allowedMethods(
                    "GET", 
                    "POST", 
                    "PUT", 
                    "DELETE", 
                    "OPTIONS", 
                    "HEAD",
                    "PATCH"
                )
                .allowedHeaders(
                    "Origin",
                    "Content-Type",
                    "Accept",
                    "Authorization",
                    "X-Requested-With",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                )
                .exposedHeaders(
                    "Access-Control-Allow-Origin",
                    "Access-Control-Allow-Credentials",
                    "Authorization"
                )
                .allowCredentials(true)
                .maxAge(3600);
    }
}