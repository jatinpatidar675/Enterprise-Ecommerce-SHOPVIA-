package com.example.demo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.DealRequest;
import com.example.demo.dto.DealResponse;
import com.example.demo.entity.Deal;
import com.example.demo.entity.Product;
import com.example.demo.repository.DealRepository;
import com.example.demo.repository.ProductRepository;

@Service
public class DealService {

    private static final Set<String> DEAL_TYPES = Set.of("TODAY", "FLASH", "BEST", "FEATURED");

    private final DealRepository dealRepository;
    private final ProductRepository productRepository;

    public DealService(DealRepository dealRepository, ProductRepository productRepository) {
        this.dealRepository = dealRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<DealResponse> getActiveDeals() {
        LocalDateTime now = LocalDateTime.now();
        return dealRepository.findByActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanOrderByEndsAtAsc(now, now)
                .stream()
                .map(this::toResponse)
                .filter(response -> response.stock() > 0)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DealResponse> getAllDeals() {
        return dealRepository.findAllByOrderByEndsAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getCurrentPrice(Long productId, double originalPrice) {
        LocalDateTime now = LocalDateTime.now();
        Deal bestDeal = dealRepository
                .findByActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanOrderByEndsAtAsc(now, now)
                .stream()
                .filter(deal -> deal.getProductId().equals(productId))
                .max((left, right) -> left.getDiscountPercent().compareTo(right.getDiscountPercent()))
                .orElse(null);

        BigDecimal original = BigDecimal.valueOf(originalPrice).setScale(2, RoundingMode.HALF_UP);
        if (bestDeal == null) {
            return original;
        }
        return original.multiply(BigDecimal.ONE.subtract(
                bestDeal.getDiscountPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public DealResponse create(DealRequest request) {
        validate(request);
        Deal deal = new Deal();
        apply(deal, request);
        return toResponse(dealRepository.save(deal));
    }

    @Transactional
    public DealResponse update(Long id, DealRequest request) {
        validate(request);
        Deal deal = getDeal(id);
        apply(deal, request);
        return toResponse(dealRepository.save(deal));
    }

    @Transactional
    public DealResponse setActive(Long id, boolean active) {
        Deal deal = getDeal(id);
        deal.setActive(active);
        return toResponse(dealRepository.save(deal));
    }

    @Transactional
    public void delete(Long id) {
        dealRepository.delete(getDeal(id));
    }

    private void validate(DealRequest request) {
        if (request == null || request.title() == null || request.title().isBlank()
                || request.dealType() == null || request.dealType().isBlank()
                || request.productId() == null || request.discountPercent() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All deal fields are required");
        }
        if (request.startsAt() == null || request.endsAt() == null
                || !request.startsAt().isBefore(request.endsAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deal end must be after its start");
        }
        if (request.discountPercent().signum() <= 0
                || request.discountPercent().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount must be greater than 0 and no more than 100 percent");
        }
        if (!DEAL_TYPES.contains(request.dealType().trim().toUpperCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deal type must be TODAY, FLASH, BEST, or FEATURED");
        }
        if (!productRepository.existsById(request.productId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
    }

    private void apply(Deal deal, DealRequest request) {
        deal.setTitle(request.title().trim());
        deal.setDealType(request.dealType().trim().toUpperCase(Locale.ROOT));
        deal.setProductId(request.productId());
        deal.setDiscountPercent(request.discountPercent());
        deal.setStartsAt(request.startsAt());
        deal.setEndsAt(request.endsAt());
        deal.setActive(request.active() == null || request.active());
    }

    private Deal getDeal(Long id) {
        return dealRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
    }

    private DealResponse toResponse(Deal deal) {
        Product product = productRepository.findById(deal.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal product not found"));
        BigDecimal original = BigDecimal.valueOf(product.getPrice()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discounted = original.multiply(BigDecimal.ONE.subtract(
                deal.getDiscountPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                .setScale(2, RoundingMode.HALF_UP);
        return new DealResponse(
                deal.getId(), deal.getTitle(), deal.getDealType(), product.getId(), product.getName(),
                product.getCategory(), product.getImage(), original, discounted, deal.getDiscountPercent(),
                product.getQuantity(), deal.getStartsAt(), deal.getEndsAt(), deal.isActive());
    }
}

