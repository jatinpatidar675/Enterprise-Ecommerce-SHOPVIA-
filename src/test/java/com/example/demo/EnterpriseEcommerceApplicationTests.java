package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import com.example.demo.entity.User;
import com.example.demo.entity.Product;
import com.example.demo.entity.Category;
import com.example.demo.entity.Deal;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.DealRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WishlistItemRepository;
import com.example.demo.service.CurrentUserAccessService;
import com.example.demo.service.JwtService;
import com.example.demo.service.LocalAdminBootstrap;
import com.example.demo.service.UserService;
import com.example.demo.service.WishlistService;
import com.example.demo.dto.WishlistItemResponse;
import com.example.demo.dto.CategoryRequest;
import com.example.demo.dto.CategoryResponse;
import com.example.demo.dto.DealRequest;
import com.example.demo.dto.DealResponse;
import com.example.demo.service.CategoryService;
import com.example.demo.service.DealService;
import com.example.demo.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"spring.profiles.active=local", "jwt.secret="})
class EnterpriseEcommerceApplicationTests {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private WishlistItemRepository wishlistRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CurrentUserAccessService currentUserAccessService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private DealService dealService;

    @AfterEach
    void cleanUp() {
        SecurityContextHolder.clearContext();
        dealRepository.deleteAll();
        categoryRepository.deleteAll();
        wishlistRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void contextLoads() {
    }

    @Test
    void productImageGalleryPersistsAndKeepsFirstImageAsCover() {
        Product product = new Product(
                "Gallery product", "Product with multiple angles", 99.0, 3, "Accessories", "legacy.jpg");
        product.setImages(List.of("front.jpg", "side.jpg", "detail.jpg"));

        Product saved = productService.addProduct(product);
        Product reloaded = productRepository.findById(saved.getId()).orElseThrow();

        assertEquals(List.of("front.jpg", "side.jpg", "detail.jpg"), reloaded.getImages());
        assertEquals("front.jpg", reloaded.getImage());
    }

    @Test
    void registrationForcesUserRoleAndDoesNotSerializePassword() {
        User request = new User(
                "Test Customer",
                "customer@example.test",
                "Password123!",
                "9876543210",
                "ADMIN");

        User registered = userService.registerUser(request);

        assertEquals("USER", registered.getRole());
        assertNotEquals("Password123!", registered.getPassword());
        assertFalse(new ObjectMapper().valueToTree(registered).has("password"));
    }

    @Test
    void customerResourceAccessIsOwnerScopedAndAdminsCanAccessAnyOwner() {
        User owner = userService.registerUser(new User(
                "Owner",
                "owner@example.test",
                "Password123!",
                "9876543210",
                "USER"));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        owner.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))));

        assertDoesNotThrow(()
                -> currentUserAccessService.requireOwnerOrAdmin(owner.getId()));
        assertThrows(AccessDeniedException.class, ()
                -> currentUserAccessService.requireOwnerOrAdmin(owner.getId() + 1));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin@example.test",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));

        assertDoesNotThrow(()
                -> currentUserAccessService.requireOwnerOrAdmin(owner.getId() + 1));
    }

    @Test
    void localProfileUsesAnEphemeralJwtSecret() {
        MockEnvironment environment = new MockEnvironment();
        environment.setDefaultProfiles("local");

        JwtService jwtService = new JwtService("", environment);
        User user = new User("Local", "local@example.test", "", "", "USER");
        user.setId(7L);

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
        assertNotEquals(token, new JwtService("", environment).generateToken(user));
    }

    @Test
    void productionProfileRequiresConfiguredJwtSecret() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        assertThrows(IllegalStateException.class, () -> new JwtService("", environment));
    }

    @Test
    void localAdminBootstrapHashesPasswordAndAssignsAdminRole() {
        LocalAdminBootstrap bootstrap = new LocalAdminBootstrap(
                userRepository,
                passwordEncoder,
                "admin@gmail.com",
                "Admin@123");

        bootstrap.run(null);

        User admin = userRepository.findByEmail("admin@gmail.com");
        assertEquals("ADMIN", admin.getRole());
        assertNotEquals("Admin@123", admin.getPassword());
        assertTrue(passwordEncoder.matches("Admin@123", admin.getPassword()));
    }

    @Test
    void wishlistPreventsDuplicatesAndMovesProductToCart() {
        User user = userService.registerUser(new User(
                "Wishlist Customer", "wishlist@example.test", "Password123!", "9876543210", "USER"));
        Product product = productRepository.save(
                new Product("Wishlist product", "Live details", 129.5, 4, "Audio", "audio.jpg"));

        WishlistItemResponse first = wishlistService.addProduct(user.getId(), product.getId());
        WishlistItemResponse duplicate = wishlistService.addProduct(user.getId(), product.getId());

        assertEquals(first.id(), duplicate.id());
        assertEquals(1, wishlistService.getWishlist(user.getId()).size());
        assertEquals(129.5, duplicate.price());
        assertEquals(4, duplicate.stock());
        assertTrue(duplicate.available());

        wishlistService.moveToCart(user.getId(), product.getId());

        assertTrue(wishlistService.getWishlist(user.getId()).isEmpty());
        assertEquals(1, cartRepository.findByUserId(user.getId()).size());
    }

    @Test
    void wishlistShowsCurrentPriceAndStock() {
        User user = userService.registerUser(new User(
                "Availability Customer", "availability@example.test", "Password123!", "9876543210", "USER"));
        Product product = productRepository.save(
                new Product("Changing product", "Details", 100, 2, "Accessories", "case.jpg"));
        wishlistService.addProduct(user.getId(), product.getId());

        product.setPrice(75);
        product.setQuantity(0);
        productRepository.save(product);

        WishlistItemResponse response = wishlistService.getWishlist(user.getId()).get(0);
        assertEquals(75, response.price());
        assertEquals(0, response.stock());
        assertFalse(response.available());
    }

    @Test
    void categoryHierarchyIncludesLegacyProductCategories() {
        CategoryResponse parent = categoryService.create(
                new CategoryRequest("Home", "Home products", "home.jpg", null, true));
        CategoryResponse child = categoryService.create(
                new CategoryRequest("Lighting", "Lights", "lights.jpg", parent.id(), true));
        productRepository.save(new Product("Desk lamp", "LED lamp", 35, 8, "Lighting", "lamp.jpg"));

        assertEquals(parent.id(), child.parentId());
        CategoryResponse dynamicCategory = categoryService.getActiveCategories().stream()
                .filter(category -> category.name().equals("Lighting"))
                .findFirst()
                .orElseThrow();
        assertEquals(1, dynamicCategory.productCount());
        assertEquals(1, categoryService.getProducts("Lighting").size());
    }

    @Test
    void dealsEnforceDatesAndProvideServerCalculatedPrices() {
        Product product = productRepository.save(
                new Product("Deal product", "Discounted product", 100, 5, "Audio", "audio.jpg"));
        LocalDateTime now = LocalDateTime.now();

        dealService.create(new DealRequest(
                "Active flash", "FLASH", product.getId(), BigDecimal.valueOf(20),
                now.minusMinutes(1), now.plusMinutes(30), true));
        dealService.create(new DealRequest(
                "Expired", "TODAY", product.getId(), BigDecimal.valueOf(50),
                now.minusHours(2), now.minusHours(1), true));
        dealService.create(new DealRequest(
                "Disabled", "FEATURED", product.getId(), BigDecimal.valueOf(60),
                now.minusMinutes(1), now.plusHours(1), false));

        List<DealResponse> active = dealService.getActiveDeals();
        assertEquals(1, active.size());
        assertEquals(BigDecimal.valueOf(80).setScale(2), active.get(0).discountedPrice());
        assertEquals(80.0, dealService.getCurrentPrice(product.getId(), product.getPrice()).doubleValue());
    }

    @Test
    void dealsRejectInvalidDateRanges() {
        Product product = productRepository.save(
                new Product("Invalid deal product", "Product", 100, 1, "Audio", "audio.jpg"));
        LocalDateTime now = LocalDateTime.now();

        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> dealService.create(new DealRequest(
                        "Bad dates", "FLASH", product.getId(), BigDecimal.TEN,
                        now.plusHours(2), now.plusHours(1), true)));
    }

}
