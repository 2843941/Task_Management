/* Captures username/password when user registers */

package com.taskmanager.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
}