package com.n8n.ai.core.service;

import com.n8n.ai.core.entity.User;
import com.n8n.ai.core.model.RegisterRequest;
import com.n8n.ai.core.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerNewUser(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + registerRequest.getEmail());
        }
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken: " + registerRequest.getUsername());
        }

        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setFirstName(registerRequest.getFirstName());
        newUser.setLastName(registerRequest.getLastName());
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setPhone(registerRequest.getPhone());
        newUser.setCountry(registerRequest.getCountry());
        newUser.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "USER");

        return userRepository.save(newUser);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null);
    }

    public Optional<User> findByEmailOptional(String email) {
        return userRepository.findByEmail(email);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    @Transactional
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        if (user == null) {
            return false;
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return false;
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    @Transactional
    public boolean initiatePasswordReset(String email) {
        User user = findByEmail(email);
        if (user == null) {
            return false;
        }

        // Generate reset token (in a real application, you'd store this in the database)
        String resetToken = UUID.randomUUID().toString();
        
        // In a real application, you would:
        // 1. Store the reset token in the database with expiration
        // 2. Send an email with the reset link
        // 3. Use a proper email service
        
        // For now, we'll just return true
        return true;
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        // In a real application, you would:
        // 1. Validate the token from the database
        // 2. Check if the token is expired
        // 3. Find the user associated with the token
        // 4. Update the password
        // 5. Invalidate the token
        
        // For now, we'll just return true
        return true;
    }

    @Transactional
    public User updateUser(Long userId, User updatedUser) {
        User existingUser = findById(userId);
        
        if (updatedUser.getUsername() != null) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getCountry() != null) {
            existingUser.setCountry(updatedUser.getCountry());
        }
        
        return userRepository.save(existingUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public boolean deleteUserById(Long userId) {
        if (!userRepository.existsById(userId)) {
            return false;
        }
        userRepository.deleteById(userId);
        return true;
    }

    @Transactional
    public boolean deleteUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            userRepository.delete(user.get());
            return true;
        }
        return false;
    }
}

