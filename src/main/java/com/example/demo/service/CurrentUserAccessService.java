package com.example.demo.service;

import java.util.Objects;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;

@Service
public class CurrentUserAccessService {

    private final UserService userService;

    public CurrentUserAccessService(UserService userService) {
        this.userService = userService;
    }

    public void requireOwnerOrAdmin(Long resourceUserId) {
        Authentication authentication
                = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (isAdmin) {
            return;
        }

        User currentUser = userService.findByEmail(authentication.getName());
        if (currentUser == null || !Objects.equals(currentUser.getId(), resourceUserId)) {
            throw new AccessDeniedException("You cannot access another user's data");
        }
    }
}
