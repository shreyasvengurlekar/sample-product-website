// Product Data
const products = [
    {
        id: 1,
        name: 'Sampli Pro X',
        description: 'Our flagship wireless headphones with premium sound quality and active noise cancellation.',
        price: 299.99,
        image: 'images/headphones-1.svg',
        colors: ['#000000', '#FFFFFF', '#6c63ff'],
        type: 'headphones'
    },
    {
        id: 2,
        name: 'Sampli Air',
        description: 'Lightweight wireless earbuds with crystal clear sound and comfortable fit.',
        price: 149.99,
        image: 'images/headphones-2.svg',
        colors: ['#000000', '#6c63ff', '#ff6b6b'],
        type: 'earbuds'
    },
    {
        id: 3,
        name: 'Sampli Sport',
        description: 'Water-resistant wireless earbuds designed for athletes and active lifestyles.',
        price: 179.99,
        image: 'images/headphones-3.svg',
        colors: ['#000000', '#4caf50', '#ff6b6b'],
        type: 'earbuds'
    },
    {
        id: 4,
        name: 'Sampli Studio',
        description: 'Professional-grade headphones for music production and audio engineering.',
        price: 349.99,
        image: 'images/headphones-4.svg',
        colors: ['#000000', '#FFFFFF', '#333333'],
        type: 'headphones'
    }
];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const confirmationModal = document.getElementById('confirmation-modal');
const closeConfirmation = document.getElementById('close-confirmation');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');

// Search and Filter Elements
const productSearch = document.getElementById('product-search');
const searchBtn = document.getElementById('search-btn');
const priceFilter = document.getElementById('price-filter');
const typeFilter = document.getElementById('type-filter');
const resetFiltersBtn = document.getElementById('reset-filters');

// Cart State
let cart = [];
let selectedColors = {};

// Search and Filter State
let filteredProducts = [...products];
let searchTerm = '';
let currentPriceRange = 'all';
let currentType = 'all';

// Initialize the page
function init() {
    renderProducts();
    setupEventListeners();
    setupSearchAndFilters();
}

// Render products to the product grid
function renderProducts() {
    productGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Set the selected color to the first color by default
        if (!selectedColors[product.id]) {
            selectedColors[product.id] = product.colors[0];
        }
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-type">Type: ${product.type.charAt(0).toUpperCase() + product.type.slice(1)}</div>
                <div class="product-colors">
                    ${product.colors.map(color => `
                        <div class="color-option ${color === selectedColors[product.id] ? 'active' : ''}" 
                             style="background-color: ${color};"
                             data-color="${color}"
                             data-product-id="${product.id}"></div>
                    `).join('')}
                </div>
                <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Color selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('color-option')) {
            const productId = parseInt(e.target.dataset.productId);
            const color = e.target.dataset.color;
            
            selectedColors[productId] = color;
            
            // Update active color
            document.querySelectorAll(`.color-option[data-product-id="${productId}"]`).forEach(option => {
                option.classList.remove('active');
            });
            e.target.classList.add('active');
        }
    });
    
    // Add to cart
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.productId);
            addToCart(productId);
        }
    });
    
    // Open cart
    cartIcon.addEventListener('click', function() {
        cartModal.classList.add('active');
    });
    
    // Close cart
    closeCart.addEventListener('click', function() {
        cartModal.classList.remove('active');
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            openCheckout();
        }
    });
    
    // Close checkout
    closeCheckout.addEventListener('click', function() {
        checkoutModal.classList.remove('active');
    });
    
    // Checkout form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder();
    });
    
    // Close confirmation
    closeConfirmation.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
    });
    
    // Continue shopping
    continueShoppingBtn.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
    });
    
    // Cart item quantity buttons and remove
    cartItems.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const itemId = parseInt(e.target.closest('.cart-item').dataset.itemId);
            const action = e.target.dataset.action;
            
            updateCartItemQuantity(itemId, action);
        }
        
        if (e.target.classList.contains('remove-item')) {
            const itemId = parseInt(e.target.closest('.cart-item').dataset.itemId);
            removeCartItem(itemId);
        }
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const color = selectedColors[productId];
    
    // Check if product with same color already in cart
    const existingItemIndex = cart.findIndex(item => 
        item.product.id === productId && item.color === color
    );
    
    if (existingItemIndex !== -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id: Date.now(), // Unique ID for cart item
            product: product,
            color: color,
            quantity: 1
        });
    }
    
    updateCart();
    cartModal.classList.add('active');
}

// Update cart display
function updateCart() {
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    renderCartItems();
    
    // Update cart total
    updateCartTotal();
}

// Render cart items
function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.itemId = item.id;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.product.image}" alt="${item.product.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                <div class="cart-item-color">
                    <div class="cart-item-color-dot" style="background-color: ${item.color};"></div>
                    Color: ${getColorName(item.color)}
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <button class="remove-item">Remove</button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
}

// Update cart total price
function updateCartTotal() {
    const total = cart.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
    }, 0);
    
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// Update cart item quantity
function updateCartItemQuantity(itemId, action) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        if (action === 'increase') {
            cart[itemIndex].quantity += 1;
        } else if (action === 'decrease') {
            cart[itemIndex].quantity -= 1;
            
            // Remove item if quantity is 0
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
        
        updateCart();
    }
}

// Remove item from cart
function removeCartItem(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Open checkout
function openCheckout() {
    // Hide cart modal
    cartModal.classList.remove('active');
    
    // Show checkout modal
    checkoutModal.classList.add('active');
    
    // Render checkout items
    renderCheckoutItems();
    
    // Update checkout total
    updateCheckoutTotal();
}

// Render checkout items
function renderCheckoutItems() {
    checkoutItems.innerHTML = '';
    
    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        
        checkoutItem.innerHTML = `
            <div class="checkout-item-image">
                <img src="${item.product.image}" alt="${item.product.name}">
            </div>
            <div class="checkout-item-details">
                <div class="checkout-item-name">${item.product.name}</div>
                <div class="checkout-item-price">$${item.product.price.toFixed(2)}</div>
                <div class="checkout-item-quantity">Qty: ${item.quantity} | Color: ${getColorName(item.color)}</div>
            </div>
        `;
        
        checkoutItems.appendChild(checkoutItem);
    });
}

// Update checkout total price
function updateCheckoutTotal() {
    const total = cart.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
    }, 0);
    
    checkoutTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// Process order
function processOrder() {
    // In a real application, this would send the order to a server
    // For this demo, we'll just show the confirmation and clear the cart
    
    // Hide checkout modal
    checkoutModal.classList.remove('active');
    
    // Show confirmation modal
    confirmationModal.classList.add('active');
    
    // Clear cart
    cart = [];
    updateCart();
}

// Helper function to get color name from hex
function getColorName(hex) {
    const colorMap = {
        '#000000': 'Black',
        '#FFFFFF': 'White',
        '#6c63ff': 'Purple',
        '#ff6b6b': 'Red',
        '#4caf50': 'Green',
        '#333333': 'Gray'
    };
    
    return colorMap[hex] || hex;
}

// Setup search and filters functionality
function setupSearchAndFilters() {
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    productSearch.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter functionality
    priceFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', resetFilters);
}

// Perform search based on search input
function performSearch() {
    searchTerm = productSearch.value.trim().toLowerCase();
    applyFilters();
}

// Apply all filters and search
function applyFilters() {
    currentPriceRange = priceFilter.value;
    currentType = typeFilter.value;
    
    filteredProducts = products.filter(product => {
        // Apply search filter
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm);
        
        // Apply price filter
        let matchesPrice = true;
        if (currentPriceRange !== 'all') {
            if (currentPriceRange === '0-150') {
                matchesPrice = product.price < 150;
            } else if (currentPriceRange === '150-250') {
                matchesPrice = product.price >= 150 && product.price < 250;
            } else if (currentPriceRange === '250-350') {
                matchesPrice = product.price >= 250 && product.price < 350;
            } else if (currentPriceRange === '350+') {
                matchesPrice = product.price >= 350;
            }
        }
        
        // Apply type filter
        const matchesType = currentType === 'all' || product.type === currentType;
        
        return matchesSearch && matchesPrice && matchesType;
    });
    
    renderProducts();
}

// Reset all filters and search
function resetFilters() {
    productSearch.value = '';
    priceFilter.value = 'all';
    typeFilter.value = 'all';
    
    searchTerm = '';
    currentPriceRange = 'all';
    currentType = 'all';
    
    filteredProducts = [...products];
    renderProducts();
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);