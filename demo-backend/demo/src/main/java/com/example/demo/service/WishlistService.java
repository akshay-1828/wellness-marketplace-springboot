package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.model.Wishlist;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void addToWishlist(Long userId, Long productId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            return; // Already in wishlist
        }
        
        // Verify product exists
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Product not found");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUserId(userId);
        wishlist.setProductId(productId);
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public List<Product> getWishlistProducts(Long userId) {
        List<Wishlist> items = wishlistRepository.findByUserId(userId);
        List<Long> productIds = items.stream().map(Wishlist::getProductId).collect(Collectors.toList());
        return productRepository.findAllById(productIds);
    }
    
    public List<Long> getWishlistProductIds(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());
    }
}