package com.pathlab.repository;

import com.pathlab.entity.BlacklistedJwt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlacklistedJwtRepository extends JpaRepository<BlacklistedJwt, Long> {
    Optional<BlacklistedJwt> findByToken(String token);
    boolean existsByToken(String token);
}


