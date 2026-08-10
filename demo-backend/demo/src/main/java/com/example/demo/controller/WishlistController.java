package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.WishlistService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    public WishlistController(WishlistService wishlistService, UserRepository userRepository) {
        this.wishlistService = wishlistService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        
        Object principal = auth.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping
    public List<Product> getWishlist() {
        User user = getAuthenticatedUser();
        return wishlistService.getWishlistProducts(user.getId());
    }

    @GetMapping("/ids")
    public List<Long> getWishlistIds() {
        User user = getAuthenticatedUser();
        return wishlistService.getWishlistProductIds(user.getId());
    }

    @PostMapping("/{productId}")
    public void addToWishlist(@PathVariable Long productId) {
        User user = getAuthenticatedUser();
        wishlistService.addToWishlist(user.getId(), productId);
    }

    @DeleteMapping("/{productId}")
    public void removeFromWishlist(@PathVariable Long productId) {
        User user = getAuthenticatedUser();
        wishlistService.removeFromWishlist(user.getId(), productId);
    }
}