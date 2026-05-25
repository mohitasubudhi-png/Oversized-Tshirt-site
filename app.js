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
        
        // Inject Video for Hover Preview
        if (!wrapper.querySelector('video')) {
            const video = document.createElement('video');
            video.className = 'hover-video';
            video.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
            video.muted = true; video.loop = true; video.playsInline = true;
            wrapper.appendChild(video);
        }

        // Handle image load
        if (img.complete) {
            wrapper.classList.add('loaded');
        } else {
            img.addEventListener('load', () => wrapper.classList.add('loaded'));
        }
        
        // Video Play/Pause on hover
        const vid = wrapper.querySelector('video');
        card.addEventListener('mouseenter', () => vid.play().catch(()=>{}));
        card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
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
                img: card.getAttribute('data-img')
            };

            modalImg.src = currentSelectedProduct.img;
            modalTitle.textContent = currentSelectedProduct.name;
            modalPrice.textContent = `$${currentSelectedProduct.price}`;
            
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
        if (!selectedSize || !currentSelectedProduct) return;

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
            modalAddToCart.textContent = `ADD TO CART - ${selectedSize}`;
            navCartBtn.classList.remove('bounce');
            
            modalOverlay.classList.remove('active');
            modal.classList.remove('active');
            openCart();
        }, 1000);
    });

    // Checkout & Apple Pay Button Alert
    const preLaunchAlert = () => alert("Checkout is currently disabled during the pre-launch phase. Join the newsletter to be notified when the drop goes live!");
    
    document.querySelectorAll('.checkout-btn, .apple-pay-btn').forEach(btn => {
        btn.addEventListener('click', preLaunchAlert);
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

    // --- 8. AUTHENTICATION SYSTEM (MOCK) ---
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

    // State Management
    let currentUser = JSON.parse(localStorage.getItem('ovrsz_user')) || null;

    const renderAuthState = () => {
        if (currentUser) {
            navAuthBtn.textContent = 'PROFILE';
            authFormsView.classList.add('hidden');
            profileView.classList.remove('hidden');
            profileName.textContent = currentUser.name;
            profileEmail.textContent = currentUser.email;
            profileAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        } else {
            navAuthBtn.textContent = 'LOGIN';
            authFormsView.classList.remove('hidden');
            profileView.classList.add('hidden');
        }
    };

    renderAuthState();

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
            // Mock auth bypass: Just log them in as long as they typed something
            const mockUser = { name: email.split('@')[0], email: email };
            localStorage.setItem('ovrsz_user', JSON.stringify(mockUser));
            currentUser = mockUser;
            renderAuthState();
        });
    }

    // Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const mockUser = { name: name, email: email };
            localStorage.setItem('ovrsz_user', JSON.stringify(mockUser));
            currentUser = mockUser;
            renderAuthState();
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ovrsz_user');
            currentUser = null;
            renderAuthState();
        });
    }

} catch (err) {
    document.body.innerHTML = `<h1 style="color:red; z-index:99999; position:relative; padding: 50px;">JS ERROR: ${err.message}<br><br>${err.stack}</h1>`;
}
});
