// Authentication state management
let currentUser = null;

// Toggle modal visibility
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('show');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.login-modal, .signup-modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// Handle signup
async function handleSignup() {
    const username = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const preference = document.querySelector('input[name="preference"]:checked')?.value;

    if (!username || !email || !password || !preference) {
        alert('Please fill in all fields and select a preference');
        return;
    }

    try {
        const response = await fetch('auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'signup',
                username,
                email,
                password,
                preference
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Sign up successful! Please login.');
            toggleModal('signupModal');
            toggleModal('loginModal');
        } else {
            alert(data.message || 'Sign up failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during sign up');
    }
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        const response = await fetch('auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'login',
                email,
                password
            })
        });

        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            updateUIAfterLogin(data.user);
            toggleModal('loginModal');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'logout'
            })
        });

        const data = await response.json();
        if (data.success) {
            currentUser = null;
            updateUIAfterLogout();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during logout');
    }
}

// Update UI after successful login
function updateUIAfterLogin(user) {
    const profileBtn = document.getElementById('profileBtn');
    const profileShort = document.getElementById('profileShort');
    
    if (profileBtn && profileShort) {
        profileShort.textContent = user.username.substring(0, 2).toUpperCase();
        profileShort.style.display = 'inline-flex';
    }

    // Add love icons to products based on user preference
    updateProductIcons(user.preference);
}

// Update UI after logout
function updateUIAfterLogout() {
    const profileShort = document.getElementById('profileShort');
    if (profileShort) {
        profileShort.style.display = 'none';
    }

    // Remove all love icons
    document.querySelectorAll('.love-icon').forEach(icon => icon.remove());
}

// Update product icons based on user preference
function updateProductIcons(preference) {
    const products = document.querySelectorAll('.productDetails');
    products.forEach(product => {
        // Remove existing love icon if any
        const existingIcon = product.querySelector('.love-icon');
        if (existingIcon) {
            existingIcon.remove();
        }

        // Check if this product matches user's preference
        const title = product.querySelector('.productDetailTitle').textContent.toLowerCase();
        const isMatch = preference === 'ice cream' ? 
            title.includes('ice cream') : 
            (title.includes('juice') || title.includes('drink'));

        if (isMatch) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-heart love-icon';
            icon.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                color: #ff1493;
                font-size: 24px;
                text-shadow: 0 0 10px rgba(255,20,147,0.5);
                z-index: 10;
            `;
            product.style.position = 'relative';
            product.insertBefore(icon, product.firstChild);
        }
    });
}

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'check_session'
            })
        });

        const data = await response.json();
        if (data.success && data.user) {
            currentUser = data.user;
            updateUIAfterLogin(data.user);
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }

    // Attach click handlers to profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            if (currentUser) {
                // Check if menu already exists
                const existingMenu = document.querySelector('.profile-menu');
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }
                // Show profile menu with logout option
                const menu = document.createElement('div');
                menu.className = 'profile-menu';
                menu.innerHTML = `
                    <div class="profile-menu-item">${currentUser.username}</div>
                    <div class="profile-menu-item">Preference: ${currentUser.preference}</div>
                    <div class="profile-menu-item" onclick="handleLogout()">Logout</div>
                `;
                // First, ensure the profile button has the correct positioning
                profileBtn.style.position = 'relative';
                
                // Get the profile button's position
                const buttonRect = profileBtn.getBoundingClientRect();
                
                menu.style.cssText = `
                    position: fixed;
                    top: ${buttonRect.bottom + 10}px;
                    right: ${window.innerWidth - buttonRect.right}px;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    padding: 12px 0;
                    z-index: 100000;
                    border: 1px solid #e0e0ff;
                    min-width: 200px;
                    transform-origin: top right;
                    animation: profileMenuFadeIn 0.2s ease;
                `;

                // Update menu position on scroll
                const updateMenuPosition = () => {
                    const newRect = profileBtn.getBoundingClientRect();
                    menu.style.top = `${newRect.bottom + 10}px`;
                    menu.style.right = `${window.innerWidth - newRect.right}px`;
                };
                
                // Add scroll and resize listeners
                window.addEventListener('scroll', updateMenuPosition);
                window.addEventListener('resize', updateMenuPosition);

                // Add animation keyframes to the document if they don't exist
                if (!document.querySelector('#profileMenuAnimation')) {
                    const style = document.createElement('style');
                    style.id = 'profileMenuAnimation';
                    style.textContent = `
                        @keyframes profileMenuFadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(-10px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }

                // Style the menu items
                const menuItems = menu.querySelectorAll('.profile-menu-item');
                menuItems.forEach(item => {
                    item.style.cssText = `
                        padding: 10px 16px;
                        color: #2a0b8c;
                        font-size: 14px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                        white-space: nowrap;
                    `;
                });

                // Special styling for logout button
                const logoutBtn = menu.querySelector('.profile-menu-item:last-child');
                logoutBtn.style.cssText += `
                    margin-top: 8px;
                    border-top: 1px solid #e0e0ff;
                    color: #ff5d5d;
                    font-weight: 600;
                    background: #fff5f5;
                `;
                profileBtn.appendChild(menu);

                // Handle menu removal with a slight delay for smooth transitions
                const removeMenu = (e) => {
                    if (!menu.contains(e.target) && !profileBtn.contains(e.target)) {
                        menu.style.opacity = '0';
                        menu.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            if (menu && menu.parentElement) {
                                menu.remove();
                                document.removeEventListener('click', removeMenu);
                            }
                        }, 200);
                    }
                };
                
                // Add a small delay before adding the click listener to prevent immediate removal
                setTimeout(() => {
                    document.addEventListener('click', removeMenu);
                }, 10);
            } else {
                // Show login modal for non-logged in users
                toggleModal('loginModal');
            }
        });
    }
});
