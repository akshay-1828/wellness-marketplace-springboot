package com.example.demo.config;

import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.ProductCatalogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductCatalogStartupReseed implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogStartupReseed.class);

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductCatalogService productCatalogService;

    public ProductCatalogStartupReseed(ProductRepository productRepository,
                                      OrderRepository orderRepository,
                                      ProductCatalogService productCatalogService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.productCatalogService = productCatalogService;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            long orders = orderRepository.count();
            long products = productRepository.count();
            long mapped = productRepository.countByPractitionerIdIsNotNull();

            // Safety:
            // - Never reseed if orders exist (would break historical order/product references).
            // - Only reseed when there are no mapped products yet (fresh DB or old seed data).
            if (orders > 0) {
                // Non-destructive behavior: if the DB only has legacy/unmapped products, add a mapped catalog.
                if (mapped == 0) {
                    String msg = productCatalogService.addCatalogFromPractitionerSpecializationsIfMissing();
                    log.info("Startup product catalog add completed (orders exist): {}", msg);
                } else {
                    log.info("Startup product catalog reseed skipped (orders exist: {}).", orders);
                }
                return;
            }

            if (mapped > 0) {
                // Already mapped.
                log.info("Startup product catalog reseed skipped (already mapped products: {}).", mapped);
                return;
            }

            // If there are no products, or if there are products but none are mapped,
            // generate a practitioner-owned catalog.
            if (products == 0 || mapped == 0) {
                String msg = productCatalogService.reseedCatalogFromPractitionerSpecializations(false);
                log.info("Startup product catalog reseed completed: {}", msg);
            }
        } catch (Exception e) {
            // Never block app startup due to demo data reseeding.
            log.warn("Startup product catalog reseed skipped due to error: {}", e.getMessage());
        }
    }
}
