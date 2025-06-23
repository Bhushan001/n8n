package com.n8n.ai.core.controller;

import com.n8n.ai.core.entity.User;
import com.n8n.ai.core.model.LoginRequest;
import com.n8n.ai.core.model.LoginResponse;
import com.n8n.ai.core.model.RegisterRequest;
import com.n8n.ai.core.security.JwtService;
import com.n8n.ai.core.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User registeredUser = userService.registerNewUser(registerRequest);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new LoginResponse(jwt));
    }

    // Logout is typically handled on the client-side by discarding the JWT.
    // However, for completeness or if token invalidation is needed, a backend endpoint could be added.
    // @PostMapping("/logout")
    // public ResponseEntity<String> logoutUser() {
    //     // In a stateless JWT system, logout is often just deleting the token on the client side.
    //     // If you implement token blacklisting or similar server-side invalidation, logic would go here.
    //     return ResponseEntity.ok("User logged out successfully.");
    // }
}
