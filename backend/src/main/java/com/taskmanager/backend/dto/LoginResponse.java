/* Sends back JWT token + user info after successful login */

package com.taskmanager.backend.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    
    public LoginResponse(String token, Long id, String username) {
        this.token = token;
        this.id = id;
        this.username = username;
    }
}