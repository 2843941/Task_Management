/* Captures username/password when user logs in */

package com.taskmanager.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}