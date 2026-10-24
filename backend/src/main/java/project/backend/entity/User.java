package project.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, name="display_name", length=100)
    private String displayName;
    @Column(name="password_hash")
    private String passwordHash;

    @Column(nullable = false, name="created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if(this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
