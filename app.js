// --- 0. FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBZm899J0GqhNZYxFPVJIbTkS2BNeWrxTQ",
  authDomain: "oversized-tshirt.firebaseapp.com",
  databaseURL: "https://oversized-tshirt-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "oversized-tshirt",
  storageBucket: "oversized-tshirt.firebasestorage.app",
  messagingSenderId: "799746953576",
  appId: "1:799746953576:web:55d374d3a37d3463f606dd",
  measurementId: "G-RW71HCSEGM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
try {
    // --- 0. PRELOADER & SKELETON LOADERS ---
    const preloader = document.getElementById('page-preloader');
    if (preloader) {
        setTimeout(() => { preloader.classList.add('fade-out'); }, 800);
    }

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const wrapper = card.querySelector('.image-wrapper');
        const img = wrapper.querySelector('img');
        
        // Ensure skeleton class
        wrapper.classList.add('skeleton');
        
        // Handle image load
        if (img.complete) {
            wrapper.classList.add('loaded');
        } else {
            img.addEventListener('load', () => wrapper.classList.add('loaded'));
        }
    });

    // --- 1. CUSTOM CURSOR & MAGNETIC BUTTONS ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && matchMedia('(pointer:fine)').matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            // Slight delay for the outline
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Add hover states to all magnetic elements and buttons
        const clickables = document.querySelectorAll('button, a, .quick-view-btn, .product-card');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
        });

        // 3D Tilt Effect for Product Cards
        const tiltCards = document.querySelectorAll('.product-card');
        tiltCards.forEach(card => {
            const wrapper = card.querySelector('.image-wrapper');
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element.
                const y = e.clientY - rect.top;  // y position within the element.
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -15; // Max rotation 15deg
                const rotateY = ((x - centerX) / centerX) * 15;

                wrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                wrapper.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                // Adding transition for smooth snap back
                wrapper.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';
                setTimeout(() => {
                    wrapper.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease'; // remove transition for smooth tracking again
                }, 500);
            });
        });
    }

    // --- 2. MOBILE MENU ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
        closeMobileMenu.addEventListener('click', () => mobileMenu.classList.remove('active'));
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.remove('active'));
        });
    }

    // --- 3. SCROLL ANIMATIONS & PARALLAX ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer.observe(el);
    });

    const heroImage = document.querySelector('.hero-image');
    window.addEventListener('scroll', () => {
        // Subtle Parallax on Hero
        if (heroImage) {
            const scrollPos = window.scrollY;
            heroImage.style.transform = `scale(1.1) translateY(${scrollPos * 0.3}px)`;
        }
    });

    // --- 4. QUICK VIEW MODAL & SIZE SELECTION ---
    const quickViewBtns = document.querySelectorAll('.quick-view-btn:not(.sold-out-btn)');
    const modalOverlay = document.getElementById('quick-view-overlay');
    const modal = document.getElementById('quick-view-modal');
    const closeModal = document.querySelector('.close-modal');
    
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalAddToCart = document.getElementById('modal-add-to-cart');
    const sizeBtns = document.querySelectorAll('.size-btn');
    
    let currentSelectedProduct = null;
    let selectedSize = null;

    const resetModal = () => {
        sizeBtns.forEach(b => b.classList.remove('selected'));
        selectedSize = null;
        modalAddToCart.textContent = "SELECT A SIZE";
        modalAddToCart.classList.remove('ready');
        modalAddToCart.disabled = true;
    };

    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent triggering if clicked on mobile
            e.stopPropagation();
            
            const card = e.target.closest('.product-card');
            currentSelectedProduct = {
                name: card.getAttribute('data-name'),
                price: card.getAttribute('data-price'),
                img: card.getAttribute('data-img'),
                gallery: card.getAttribute('data-gallery')
            };

            modalImg.src = currentSelectedProduct.img;
            modalTitle.textContent = currentSelectedProduct.name;
            modalPrice.textContent = `$${currentSelectedProduct.price}`;
            
            // Build Thumbnail Gallery
            const thumbnailsContainer = document.getElementById('modal-thumbnails');
            if (thumbnailsContainer) {
                thumbnailsContainer.innerHTML = '';
                if (currentSelectedProduct.gallery) {
                    const images = currentSelectedProduct.gallery.split(',');
                    images.forEach((imgSrc, index) => {
                        const thumb = document.createElement('img');
                        thumb.src = imgSrc;
                        if (index === 0) thumb.classList.add('active');
                        
                        thumb.addEventListener('click', () => {
                            Array.from(thumbnailsContainer.children).forEach(c => c.classList.remove('active'));
                            thumb.classList.add('active');
                            modalImg.src = imgSrc;
                        });
                        thumbnailsContainer.appendChild(thumb);
                    });
                }
            }
            
            resetModal();
            modalOverlay.classList.add('active');
            modal.classList.add('active');
        });
    });

    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        modal.classList.remove('active');
    });
    modalOverlay.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        modal.classList.remove('active');
    });

    // Hover Magnifier Logic
    const modalImgContainer = document.querySelector('.modal-img-container');
    if (modalImgContainer) {
        modalImgContainer.addEventListener('mousemove', (e) => {
            const rect = modalImgContainer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            modalImg.style.transformOrigin = `${x}% ${y}%`;
            modalImg.style.transform = 'scale(2)';
        });
        modalImgContainer.addEventListener('mouseleave', () => {
            modalImg.style.transformOrigin = 'center';
            modalImg.style.transform = 'scale(1)';
        });
    }

    // Size Calculator Logic
    const openSizeCalc = document.getElementById('open-size-calc');
    const sizeCalcUI = document.getElementById('size-calc-ui');
    const calcHeight = document.getElementById('calc-height');
    const calcWeight = document.getElementById('calc-weight');
    const heightVal = document.getElementById('height-val');
    const weightVal = document.getElementById('weight-val');
    const calcRecommendation = document.getElementById('calc-recommendation');

    const updateSize = () => {
        const h = parseInt(calcHeight.value);
        const w = parseInt(calcWeight.value);
        heightVal.textContent = h + 'cm';
        weightVal.textContent = w + 'kg';
        
        let rec = 'M';
        if (h > 185 || w > 90) rec = 'XL';
        else if (h > 178 || w > 80) rec = 'L';
        else if (h < 165 && w < 65) rec = 'S';
        
        calcRecommendation.textContent = rec;
    };

    if (openSizeCalc) {
        openSizeCalc.addEventListener('click', () => sizeCalcUI.classList.toggle('hidden'));
        calcHeight.addEventListener('input', updateSize);
        calcWeight.addEventListener('input', updateSize);
    }

    // Size Selection Logic
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedSize = e.target.getAttribute('data-size');
            
            modalAddToCart.textContent = `ADD TO CART - ${selectedSize}`;
            modalAddToCart.classList.add('ready');
            modalAddToCart.disabled = false;
        });
    });

    // --- 5. ENHANCED CART LOGIC WITH LOCAL STORAGE ---
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartDrawer = document.querySelector('.cart-drawer');
    const navCartBtn = document.getElementById('nav-cart-btn');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const shippingMsg = document.getElementById('shipping-msg');
    const shippingFill = document.getElementById('shipping-fill');
    
    // Load cart from local storage if it exists
    let cart = JSON.parse(localStorage.getItem('ovrsz_cart')) || []; 

    const saveCart = () => {
        localStorage.setItem('ovrsz_cart', JSON.stringify(cart));
        if (currentUser) {
            db.ref('users/' + currentUser.uid + '/cart').set(cart);
        }
    };

    const openCart = () => {
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
    };
    const closeCart = () => {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
    };

    navCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    const updateShippingProgress = (total) => {
        const threshold = 150.00;
        if (total >= threshold) {
            shippingMsg.textContent = "CONGRATS! YOU GET FREE SHIPPING.";
            shippingFill.style.width = "100%";
        } else {
            const remaining = (threshold - total).toFixed(2);
            shippingMsg.textContent = `ADD $${remaining} TO UNLOCK FREE SHIPPING`;
            shippingFill.style.width = `${(total / threshold) * 100}%`;
        }
    };

    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty.</p>';
            cartTotalPriceEl.textContent = '$0.00';
            navCartBtn.textContent = `CART (0)`;
            updateShippingProgress(0);
            return;
        }

        let total = 0;
        let totalQty = 0;

        cart.forEach((item, index) => {
            const itemTotal = parseFloat(item.price) * item.qty;
            total += itemTotal;
            totalQty += item.qty;
            
            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <div>
                            <h4>${item.name}</h4>
                            <p class="item-meta">Size: ${item.size}</p>
                            <span class="price">$${item.price}</span>
                        </div>
                        <div class="qty-controls">
                            <button class="qty-btn minus-btn" data-index="${index}">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn plus-btn" data-index="${index}">+</button>
                        </div>
                        <button class="remove-item" data-index="${index}">REMOVE</button>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;
        navCartBtn.textContent = `CART (${totalQty})`;
        updateShippingProgress(total);

        // Attach quantity/remove events
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                cart.splice(e.target.getAttribute('data-index'), 1);
                saveCart();
                renderCart();
            });
        });
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                if (cart[idx].qty > 1) {
                    cart[idx].qty -= 1;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
                renderCart();
            });
        });
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                cart[e.target.getAttribute('data-index')].qty += 1;
                saveCart();
                renderCart();
            });
        });
    };

    // Initial render to load from local storage
    renderCart();

    // Add to cart from Modal
    modalAddToCart.addEventListener('click', () => {
        if (!currentSelectedProduct) return;
        
        if (!selectedSize) {
            alert("Please select a size first!");
            return;
        }

        // AUTH CHECK: Force login if adding to cart
        if (!currentUser) {
            document.getElementById('nav-auth-btn').click(); // Opens Auth Modal
            document.querySelector('.close-modal').click(); // Closes Quick View Modal
            return;
        }

        const cartId = currentSelectedProduct.name + selectedSize;
        const existingItem = cart.find(i => i.id === cartId);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: cartId,
                name: currentSelectedProduct.name,
                price: currentSelectedProduct.price,
                img: currentSelectedProduct.img,
                size: selectedSize,
                qty: 1
            });
        }

        saveCart();
        renderCart();
        
        // Micro-Interactions
        modalAddToCart.classList.add('btn-added');
        modalAddToCart.textContent = '✓ ADDED';
        navCartBtn.classList.add('bounce');
        
        setTimeout(() => {
            modalAddToCart.classList.remove('btn-added');
            modalAddToCart.textContent = `ADD TO CART`;
            navCartBtn.classList.remove('bounce');
        }, 1500);

        // Open cart drawer immediately after adding
        openCart();
    });

    const modalWishlist = document.getElementById('modal-wishlist');
    if (modalWishlist) {
        modalWishlist.addEventListener('click', () => {
            if (!currentUser) {
                document.getElementById('nav-auth-btn').click(); 
                document.querySelector('.close-modal').click(); 
                return;
            }
            if (currentSelectedProduct) {
                const wishlistRef = db.ref('users/' + currentUser.uid + '/wishlist/' + currentSelectedProduct.name);
                wishlistRef.set({
                    name: currentSelectedProduct.name,
                    price: currentSelectedProduct.price,
                    img: currentSelectedProduct.img,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }).then(() => {
                    modalWishlist.innerHTML = "&#9829; SAVED";
                    setTimeout(() => { modalWishlist.innerHTML = "&#9825; WISHLIST"; }, 2000);
                }).catch((error) => {
                    alert("Firebase Database Error: Please make sure your Realtime Database Rules are set to true! " + error.message);
                });
            }
        });
    }

    // Checkout & Apple Pay Logic (Stripe)
    const handleCheckout = async (e) => {
        if (!currentUser) {
            document.getElementById('nav-auth-btn').click();
            return;
        }

        // Auto-inject item if checking out directly from Quick View
        const isFromModal = e.target.closest('.quick-view-modal');
        if (isFromModal) {
            if (!currentSelectedProduct) return;
            if (!selectedSize) {
                alert("Please select a size first!");
                return;
            }
            const cartId = currentSelectedProduct.name + selectedSize;
            const existingItem = cart.find(i => i.id === cartId);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({
                    id: cartId,
                    name: currentSelectedProduct.name,
                    price: currentSelectedProduct.price,
                    img: currentSelectedProduct.img,
                    size: selectedSize,
                    qty: 1
                });
            }
            saveCart();
            renderCart();
        }

        if (!cart || cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const btn = e.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = "PROCESSING...";
        btn.disabled = true;

        try {
            // This endpoint will automatically work once deployed to Vercel
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: cart })
            });

            const session = await response.json();
            
            if (session.error) {
                alert("Checkout Error: " + session.error);
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            // Redirect to Stripe Checkout page
            window.location.href = session.url;
        } catch (error) {
            alert("Could not connect to payment server. Make sure this is deployed to Vercel!");
            console.error(error);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
    
    document.querySelectorAll('.checkout-btn, .apple-pay-btn').forEach(btn => {
        btn.addEventListener('click', handleCheckout);
    });

    // --- 5.5 SEARCH OVERLAY LOGIC ---
    const searchOverlay = document.getElementById('search-overlay');
    const navSearchBtn = document.getElementById('nav-search-btn');
    const closeSearchBtn = document.querySelector('.close-search');
    const searchInput = document.getElementById('live-search-input');
    const searchResults = document.getElementById('search-results');
    const searchEmptyState = document.getElementById('search-empty-state');
    
    const allProducts = Array.from(document.querySelectorAll('.product-grid .product-card'));

    const openSearch = () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    };
    const closeSearch = () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchEmptyState.classList.add('hidden');
    };

    if (navSearchBtn) navSearchBtn.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (query.length === 0) {
                searchEmptyState.classList.add('hidden');
                return;
            }

            const matches = allProducts.filter(card => {
                return card.getAttribute('data-name').toLowerCase().includes(query);
            });

            if (matches.length === 0) {
                searchEmptyState.classList.remove('hidden');
            } else {
                searchEmptyState.classList.add('hidden');
                matches.forEach(match => {
                    const clone = match.cloneNode(true);
                    // Remove skeleton classes so they show instantly in search
                    const wrapper = clone.querySelector('.image-wrapper');
                    wrapper.classList.remove('skeleton');
                    wrapper.classList.add('loaded');
                    searchResults.appendChild(clone);
                });
            }
        });
    }

    // --- 6. FIT GUIDE TOGGLE ---
    const fitBtns = document.querySelectorAll('.fit-btn');
    const fitDesc = document.getElementById('fit-desc');
    const fitDisplay = document.getElementById('fit-display');

    fitBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            fitBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const fitType = e.target.getAttribute('data-fit');
            if (fitType === 'true-to-size') {
                fitDesc.textContent = "Go with your standard size. It is already graded to fit massive in the chest and shoulders.";
                fitDisplay.innerHTML = "<h3>OVERSIZED & CROPPED</h3><p>Our tees are designed to drape aggressively over the shoulders while sitting perfectly at the waist to prevent the 'dress' look.</p>";
            } else {
                fitDesc.textContent = "Size up only if you want an extreme, mid-thigh length 'dress' fit. This will significantly increase the width as well.";
                fitDisplay.innerHTML = "<h3>EXTREME DRAPE</h3><p>Sizing up pushes the shoulder seams down to the elbows and extends the hem. Recommended only for very tall builds.</p>";
            }
        });
    });

    // --- 7. NEWSLETTER FORM FIX ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            const input = newsletterForm.querySelector('input');
            const btn = newsletterForm.querySelector('button');
            
            input.style.display = 'none';
            btn.style.display = 'none';
            
            const successMsg = document.createElement('h3');
            successMsg.textContent = 'YOU ARE ON THE LIST.';
            successMsg.style.color = 'var(--text-primary)';
            successMsg.style.fontFamily = 'var(--font-heading)';
            successMsg.style.marginTop = '1rem';
            
            newsletterForm.appendChild(successMsg);
        });
    }

    // --- 8. AUTHENTICATION SYSTEM (FIREBASE) ---
    const authOverlay = document.querySelector('.auth-overlay');
    const authDrawer = document.getElementById('auth-drawer');
    const navAuthBtn = document.getElementById('nav-auth-btn');
    const closeAuthBtn = document.querySelector('.close-auth');
    
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const authFormsView = document.getElementById('auth-forms-view');
    const profileView = document.getElementById('profile-view');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    const logoutBtn = document.getElementById('logout-btn');

    let currentUser = null;

    const renderAuthState = (user) => {
        if (user) {
            navAuthBtn.textContent = 'PROFILE';
            authFormsView.classList.add('hidden');
            profileView.classList.remove('hidden');
            profileName.textContent = user.displayName || user.email.split('@')[0];
            profileEmail.textContent = user.email;
            profileAvatar.textContent = (user.displayName || user.email).charAt(0).toUpperCase();
        } else {
            navAuthBtn.textContent = 'LOGIN';
            authFormsView.classList.remove('hidden');
            profileView.classList.add('hidden');
        }
    };

    // Listen for Firebase Auth State Changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        renderAuthState(user);
        if (user) {
            closeAuth(); // Close modal on successful login
            
            // Sync cloud cart to local on login
            db.ref('users/' + user.uid + '/cart').once('value').then((snapshot) => {
                const cloudCart = snapshot.val();
                if (cloudCart) {
                    cart = cloudCart;
                    localStorage.setItem('ovrsz_cart', JSON.stringify(cart));
                    if (typeof renderCart === 'function') renderCart();
                } else if (cart.length > 0) {
                    saveCart();
                }
            });

            // Sync wishlist to UI
            db.ref('users/' + user.uid + '/wishlist').on('value', (snapshot) => {
                const wishlistItems = snapshot.val();
                const container = document.getElementById('profile-wishlist-items');
                if (container) {
                    if (wishlistItems) {
                        container.innerHTML = '';
                        Object.values(wishlistItems).forEach(item => {
                            container.innerHTML += `
                                <div class="wishlist-item" style="display:flex; align-items:center; gap:1rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
                                    <img src="${item.img}" style="width:50px; height:60px; object-fit:cover;">
                                    <div>
                                        <p style="font-family: var(--font-heading); margin-bottom: 0.2rem;">${item.name}</p>
                                        <p style="color: #888; font-size: 0.9rem;">$${item.price}</p>
                                    </div>
                                    <button class="remove-wishlist-btn" data-name="${item.name}" style="margin-left:auto; background:none; border:none; color:#ff4444; font-size:1.5rem; cursor:pointer;">&times;</button>
                                </div>
                            `;
                        });

                        // Add remove listeners
                        container.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const name = e.target.getAttribute('data-name');
                                db.ref('users/' + user.uid + '/wishlist/' + name).remove();
                            });
                        });
                    } else {
                        container.innerHTML = '<p class="empty-msg" style="color:#888;">No items in wishlist yet.</p>';
                    }
                }
            });
        }
    });

    const openAuth = () => {
        authOverlay.classList.add('active');
        authDrawer.classList.add('active');
    };

    const closeAuth = () => {
        authOverlay.classList.remove('active');
        authDrawer.classList.remove('active');
    };

    if (navAuthBtn) navAuthBtn.addEventListener('click', openAuth);
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuth);
    if (authOverlay) authOverlay.addEventListener('click', closeAuth);

    // Prompt login when clicking Add to Cart
    const addCartBtns = document.querySelectorAll('.add-cart-btn, .quick-view-btn');
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Only require login for adding to cart, not quick view browsing
            if (e.target.classList.contains('add-cart-btn') && !currentUser) {
                e.stopPropagation();
                openAuth();
            }
        });
    });

    // Form Toggle Logic
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            showLoginBtn.classList.add('active');
            showRegisterBtn.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });
    }

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            showRegisterBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const btn = loginForm.querySelector('button');
            btn.textContent = "LOGGING IN...";
            
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => {
                    btn.textContent = "LOGIN";
                    loginForm.reset();
                })
                .catch((error) => {
                    alert("Login Failed: " + error.message);
                    btn.textContent = "LOGIN";
                });
        });
    }

    // Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const pass = document.getElementById('reg-password').value;
            const btn = registerForm.querySelector('button');
            btn.textContent = "CREATING...";
            
            auth.createUserWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    return userCredential.user.updateProfile({
                        displayName: name
                    });
                })
                .then(() => {
                    btn.textContent = "CREATE ACCOUNT";
                    registerForm.reset();
                })
                .catch((error) => {
                    alert("Registration Failed: " + error.message);
                    btn.textContent = "CREATE ACCOUNT";
                });
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                // CLEAR CART STATE FOR PRIVACY
                cart = [];
                localStorage.removeItem('ovrsz_cart');
                if (typeof renderCart === 'function') renderCart();
                
                alert("Successfully logged out.");
                closeAuth();
            });
        });
    }

} catch (err) {
    document.body.innerHTML = `<h1 style="color:red; z-index:99999; position:relative; padding: 50px;">JS ERROR: ${err.message}<br><br>${err.stack}</h1>`;
}
});
