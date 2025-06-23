package com.n8n.ai.core.controller;

import com.n8n.ai.core.entity.User;
import com.n8n.ai.core.model.LoginRequest;
import com.n8n.ai.core.model.LoginResponse;
import com.n8n.ai.core.model.RefreshTokenRequest;
import com.n8n.ai.core.model.RegisterRequest;
import com.n8n.ai.core.security.CustomUserDetailsService;
import com.n8n.ai.core.security.JwtService;
import com.n8n.ai.core.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "https://your-production-domain.com"})
public class AuthController {

    private final UserService userService;
    private final CustomUserDetailsService customUserDetailsService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService, CustomUserDetailsService customUserDetailsService, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userService = userService;
        this.customUserDetailsService = customUserDetailsService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User registeredUser = userService.registerNewUser(registerRequest);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Get the full user object to include firstName and lastName
            User user = userService.findByEmail(loginRequest.getEmail());
            
            // Create extra claims for the JWT token
            Map<String, Object> extraClaims = new HashMap<>();
            if (user != null) {
                extraClaims.put("firstName", user.getFirstName());
                extraClaims.put("lastName", user.getLastName());
                extraClaims.put("username", user.getUsername());
                extraClaims.put("roles", Collections.singletonList("ROLE_" + user.getRole()));
            }
            
            String accessToken = jwtService.generateToken(extraClaims, userDetails);
            String refreshToken = jwtService.generateRefreshToken(extraClaims, userDetails);
            
            LoginResponse response = new LoginResponse(accessToken, refreshToken, 3600); // 1 hour expiry
            
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed");
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            if (jwtService.validateRefreshToken(refreshRequest.getRefreshToken())) {
                String username = jwtService.extractUsernameFromRefreshToken(refreshRequest.getRefreshToken());
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                
                // Get the full user object to include firstName and lastName
                User user = userService.findByEmail(username);
                
                // Create extra claims for the JWT token
                Map<String, Object> extraClaims = new HashMap<>();
                if (user != null) {
                    extraClaims.put("firstName", user.getFirstName());
                    extraClaims.put("lastName", user.getLastName());
                    extraClaims.put("username", user.getUsername());
                    extraClaims.put("roles", Collections.singletonList("ROLE_" + user.getRole()));
                }
                
                String newAccessToken = jwtService.generateToken(extraClaims, userDetails);
                String newRefreshToken = jwtService.generateRefreshToken(extraClaims, userDetails);
                
                LoginResponse response = new LoginResponse(newAccessToken, newRefreshToken, 3600);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid refresh token");
                error.put("message", "Refresh token is invalid or expired");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Token refresh failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // In a stateless JWT system, logout is typically handled client-side
        // However, you could implement token blacklisting here if needed
        Map<String, String> response = new HashMap<>();
        response.put("message", "User logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User user = userService.findByEmail(username);
                if (user != null) {
                    // Don't return sensitive information like password hash
                    user.setPasswordHash(null);
                    return ResponseEntity.ok(user);
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve user information"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password and new password are required"));
            }
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            boolean success = userService.changePassword(username, currentPassword, newPassword);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            boolean success = userService.initiatePasswordReset(email);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password reset instructions sent to your email"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Email not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process password reset request"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
            }
            
            boolean success = userService.resetPassword(token, newPassword);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password"));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.findAllUsers();
            // Remove sensitive information from all users
            users.forEach(user -> user.setPasswordHash(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve users"));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            boolean success = userService.deleteUserById(userId);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user"));
        }
    }

    @DeleteMapping("/users/email/{email}")
    public ResponseEntity<?> deleteUserByEmail(@PathVariable String email) {
        try {
            boolean success = userService.deleteUserByEmail(email);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user"));
        }
    }
}
