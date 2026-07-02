package com.pathlab.service;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthHelper {

    public Long getLoggedInRefId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object details = auth.getDetails();
        if (details instanceof Claims claims) {
            Object refIdObj = claims.get("refId");
            if (refIdObj instanceof Integer) return ((Integer) refIdObj).longValue();
            if (refIdObj instanceof Long) return (Long) refIdObj;
        }
        return null;
    }

    public String getLoggedInUserType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object details = auth.getDetails();
        if (details instanceof Claims claims) {
            return claims.get("userType", String.class);
        }
        return null;
    }
}



