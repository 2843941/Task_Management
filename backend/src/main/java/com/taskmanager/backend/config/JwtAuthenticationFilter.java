package com.taskmanager.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        System.out.println("JwtAuthenticationFilter: Processing request to " + request.getRequestURI());
        System.out.println("JwtAuthenticationFilter: Auth header: " + authHeader);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JwtAuthenticationFilter: No Bearer token found");
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        System.out.println("JwtAuthenticationFilter: Token extracted: " + (jwt.length() > 20 ? jwt.substring(0, 20) + "..." : jwt));
        
        username = jwtService.extractUsername(jwt);
        System.out.println("JwtAuthenticationFilter: Username from token: " + username);
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("JwtAuthenticationFilter: Loading user details for: " + username);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtService.validateToken(jwt, userDetails)) {
                System.out.println("JwtAuthenticationFilter: Token is valid, setting authentication");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("JwtAuthenticationFilter: Token validation failed");
            }
        }
        
        filterChain.doFilter(request, response);
    }
}