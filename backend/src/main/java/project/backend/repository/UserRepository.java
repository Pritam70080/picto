package project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backend.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleSubject(String googleSubject);
    boolean existsByEmail(String email);
}
