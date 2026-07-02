package com.pathlab.security;

import com.pathlab.repository.BlacklistedJwtRepository;
import com.pathlab.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final BlacklistedJwtRepository blacklistedJwtRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, BlacklistedJwtRepository blacklistedJwtRepository) {
        this.jwtUtil = jwtUtil;
        this.blacklistedJwtRepository = blacklistedJwtRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (!blacklistedJwtRepository.existsByToken(token)) {
                try {
                    Claims claims = jwtUtil.parseClaims(token);
                    String subject = claims.getSubject();
                    Object rolesObj = claims.get("roles");
                    Collection<? extends GrantedAuthority> authorities = List.of();
                    if (rolesObj instanceof List<?>) {
                        List<?> roles = (List<?>) rolesObj;
                        authorities = roles.stream().map(Object::toString).map(SimpleGrantedAuthority::new).collect(Collectors.toList());
                    } else if (rolesObj instanceof String roleStr) {
                        authorities = List.of(new SimpleGrantedAuthority(roleStr));
                    }
                    Authentication auth = new UsernamePasswordAuthenticationToken(subject, null, authorities);
                    ((UsernamePasswordAuthenticationToken) auth).setDetails(claims); // store claims
                    SecurityContextHolder.getContext().setAuthentication(auth);

                } catch (Exception ignored) {
                    // Invalid token: continue without authentication
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}


