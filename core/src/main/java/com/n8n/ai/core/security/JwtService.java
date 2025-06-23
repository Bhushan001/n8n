package com.n8n.ai.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${spring.security.jwt.secret}")
    private String secretKey;
    
    @Value("${spring.security.jwt.refresh-secret}")
    private String refreshSecretKey;
    
    @Value("${spring.security.jwt.expiration}")
    private long jwtExpiration;
    
    @Value("${spring.security.jwt.refresh-expiration}")
    private long refreshExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUsernameFromRefreshToken(String refreshToken) {
        return extractClaimFromRefreshToken(refreshToken, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public <T> T extractClaimFromRefreshToken(String refreshToken, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaimsFromRefreshToken(refreshToken);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateRefreshToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration * 1000, secretKey);
    }

    public String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, refreshExpiration * 1000, refreshSecretKey);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration, String secret) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(secret), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            return !isRefreshTokenExpired(refreshToken);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private boolean isRefreshTokenExpired(String refreshToken) {
        return extractExpirationFromRefreshToken(refreshToken).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Date extractExpirationFromRefreshToken(String refreshToken) {
        return extractClaimFromRefreshToken(refreshToken, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey(secretKey))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Claims extractAllClaimsFromRefreshToken(String refreshToken) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey(refreshSecretKey))
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();
    }

    private Key getSignInKey(String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Legacy method for backward compatibility
    private Key getSignInKey() {
        return getSignInKey(secretKey);
    }
}
