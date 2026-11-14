package project.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backend.dto.AuthResponse;
import project.backend.dto.GoogleAuthRequest;
import project.backend.dto.LoginRequest;
import project.backend.dto.RegisterRequest;
import project.backend.config.GoogleProperties;
import project.backend.entity.RefreshToken;
import project.backend.entity.User;
import project.backend.exception.ResourceConflictException;
import project.backend.exception.UnauthorizedException;
import project.backend.repository.RefreshTokenRepository;
import project.backend.repository.UserRepository;

import java.time.Instant;
import java.io.IOException;
import java.security.GeneralSecurityException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final GoogleProperties googleProperties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if(userRepository.existsByEmail(email)) {
            throw new ResourceConflictException("Email is already registered.");
        }
        User user = User.builder()
                .email(email)
                .displayName(request.displayName().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .filter(account -> account.getPasswordHash() != null)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException("Invalid email or password.");
        }
        refreshTokenRepository.deleteByUserId(user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        if (googleProperties.clientId() == null || googleProperties.clientId().isBlank()) {
            throw new IllegalStateException("Google Sign-In is not configured.");
        }
        GoogleIdToken idToken;
        try {
            idToken = googleIdTokenVerifier.verify(request.credential());
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to verify Google credentials.", exception);
        } catch (GeneralSecurityException exception) {
            throw new UnauthorizedException("Invalid Google credential.");
        }
        if (idToken == null) {
            throw new UnauthorizedException("Invalid Google credential.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        if (!Boolean.TRUE.equals(payload.getEmailVerified())
                || payload.getEmail() == null || payload.getEmail().isBlank()
                || payload.getSubject() == null || payload.getSubject().isBlank()) {
            throw new UnauthorizedException("Google account must have a verified email address.");
        }

        String email = payload.getEmail().toLowerCase().trim();
        String googleSubject = payload.getSubject();
        String profileImage = payload.get("picture") instanceof String picture && !picture.isBlank()
                ? picture
                : null;
        User user = userRepository.findByGoogleSubject(googleSubject)
                .map(existingUser -> linkGoogleAccount(existingUser, googleSubject, profileImage))
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existingUser -> linkGoogleAccount(existingUser, googleSubject, profileImage))
                        .orElseGet(() -> createGoogleUser(email, payload, googleSubject, profileImage)));
        refreshTokenRepository.deleteByUserId(user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired");
        }

        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshTokenValue();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .expiresAt(jwtService.refreshTokenExpiry())
                .user(user)
                .build();
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(accessToken, refreshTokenValue, userService.toUserResponse(user));
    }

    private User linkGoogleAccount(User user, String googleSubject, String profileImage) {
        if (user.getGoogleSubject() != null && !user.getGoogleSubject().equals(googleSubject)) {
            throw new UnauthorizedException("This email is already linked to another Google account.");
        }
        user.setGoogleSubject(googleSubject);
        user.setProfileImage(profileImage);
        return userRepository.save(user);
    }

    private User createGoogleUser(
            String email,
            GoogleIdToken.Payload payload,
            String googleSubject,
            String profileImage
    ) {
        String displayName = payload.get("name") instanceof String name && !name.isBlank()
                ? name.trim()
                : email.substring(0, email.indexOf('@'));
        if (displayName.length() > 100) {
            displayName = displayName.substring(0, 100);
        }
        return userRepository.save(User.builder()
                .email(email)
                .displayName(displayName)
                .googleSubject(googleSubject)
                .profileImage(profileImage)
                .build());
    }
}
