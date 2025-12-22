// MAIN.JS - Glavna logika za IPI Akademija stranicu

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initContactForm();
    initLoginModal();
    applyUserTheme();
    updateNavigation();
    
    console.log('IPI Akademija initialized 🎓');
});

// ===== NAVIGACIJA =====
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Zatvori menu kad klikneš link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });
    
    // Smooth scroll za anchor linkove
    navLinks.forEach(link => {
        if (link.getAttribute('href')?.startsWith('#')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerOffset = 100;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
    
    // Active link na scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== SCROLL EFEKTI =====
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    // Header promjena na scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.7)';
        }
    });
    
    // Fade-in animacije
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(`
        .about-card, 
        .program-card, 
        .feature-item, 
        .testimonial-card
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== LOGIN MODAL =====
function initLoginModal() {
    const modal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnHero = document.getElementById('loginBtnHero');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    
    // Otvori modal
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });
    }
    
    if (loginBtnHero) {
        loginBtnHero.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });
    }
    
    // Zatvori modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Zatvori kad klikneš van modala
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
// Submit forma
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const result = await window.authManager.login(email, password);
        
        if (result.success) {
            showNotification(result.message, 'success');
            modal.style.display = 'none';
            
            // Preusmjeri na Angular dashboard
            setTimeout(() => {
                window.location.href = 'http://localhost:4200/dashboard';  // ← NOVO
            }, 1000);
        } else {
            showNotification(result.message, 'error');
        }
    });
}
}

// ===== KONTAKT FORMA =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            showNotification('Hvala! Vaša poruka je poslana. Odgovorit ćemo vam uskoro! ✉️', 'success');
            contactForm.reset();
        });
    }
    
    // Newsletter forme
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            if (email) {
                showNotification('Uspješno ste se prijavili na newsletter! 📧', 'success');
                form.reset();
            }
        });
    });
}

// ===== TEME =====
function applyTheme(themeName) {
    const html = document.documentElement;
    
    // Postavi data-theme atribut
    if (themeName && themeName !== 'default') {
        html.setAttribute('data-theme', themeName);
    } else {
        html.removeAttribute('data-theme');
    }
    
    // Sačuvaj u localStorage
    localStorage.setItem('selectedTheme', themeName);
}

function applyUserTheme() {
    // Prvo provjeri da li je korisnik prijavljen
    const currentUser = window.authManager?.getCurrentUser();
    
    if (currentUser && currentUser.theme) {
        applyTheme(currentUser.theme);
    } else {
        // Ako nije prijavljen, koristi sačuvanu temu
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            applyTheme(savedTheme);
        }
    }
}

// ===== NOTIFIKACIJE =====
function showNotification(message, type = 'info') {
    // Ukloni postojeću notifikaciju
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Kreiraj novu notifikaciju
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Stilizuj notifikaciju
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        background: type === 'success' ? '#2ecc71' : 
                    type === 'error' ? '#e74c3c' : 
                    type === 'warning' ? '#f39c12' : '#3498db',
        color: 'white',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });
    
    document.body.appendChild(notification);
    
    // Ukloni nakon 3 sekunde
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Dodaj CSS animacije
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function updateNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnHero = document.getElementById('loginBtnHero');
    const loginModal = document.getElementById('loginModal');
    const currentUser = window.authManager?.getCurrentUser();
    
    if (currentUser) {
        // **SAKRIJ LOGIN MODAL POTPUNO**
        if (loginModal) {
            loginModal.style.display = 'none';
            // Disable modal otvaranje
            loginModal.classList.add('disabled');
        }
        
        // **HEADER LOGIN BUTTON**
        if (loginBtn) {
            // Ukloni stari event listener za modal
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            
            // Promijeni tekst i stil
            newLoginBtn.innerHTML = `
                <span style="margin-right: 8px;">👤</span>
                <span>${currentUser.name}</span>
            `;
            newLoginBtn.style.background = 'var(--highlight)';
            newLoginBtn.classList.add('logged-in');
            
            // Dodaj novi event listener za dropdown
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showUserMenu(newLoginBtn, currentUser);
            });
        }
        
        // **HERO SECTION BUTTON**
        if (loginBtnHero) {
            // Ukloni stari event listener
            const newHeroBtn = loginBtnHero.cloneNode(true);
            loginBtnHero.parentNode.replaceChild(newHeroBtn, loginBtnHero);
            
            newHeroBtn.textContent = '🎯 Idi na Dashboard';
            newHeroBtn.classList.remove('btn-secondary');
            newHeroBtn.classList.add('btn-primary');
            
            // Dodaj novi event listener
            newHeroBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'http://localhost:4200/dashboard';
            });
        }
    } else {
        // **AKO NIJE PRIJAVLJEN** - omogući login modal
        if (loginModal) {
            loginModal.classList.remove('disabled');
        }
    }
}


// Nova funkcija za user menu
function showUserMenu(button, user) {
    // Provjeri da li već postoji menu
    const existingMenu = document.querySelector('.user-dropdown-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Kreiraj dropdown menu
    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.innerHTML = `
        <div class="menu-item" onclick="goToDashboard()">
            <span>🎯</span> Dashboard
        </div>
        <div class="menu-item" onclick="logout()">
            <span>🚪</span> Odjavi se
        </div>
    `;
    
    // Pozicioniraj menu
    const rect = button.getBoundingClientRect();
    menu.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 10}px;
        right: ${window.innerWidth - rect.right}px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 200px;
        overflow: hidden;
    `;
    
    document.body.appendChild(menu);
    
    // Zatvori menu kad klikneš van
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Helper funkcije za menu
function goToDashboard() {
    window.location.href = 'http://localhost:4200/dashboard';
}

function logout() {
    if (confirm('Želite li se odjaviti?')) {
        window.authManager.logout();
        showNotification('Uspješno ste se odjavili!', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }
}

// Dodaj CSS za dropdown menu
const menuStyle = document.createElement('style');
menuStyle.textContent = `
    .user-dropdown-menu .menu-item {
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #2c3e50;
    }
    
    .user-dropdown-menu .menu-item:hover {
        background: #f8f9fa;
    }
    
    .user-dropdown-menu .menu-item:active {
        background: #e9ecef;
    }
    
    .user-dropdown-menu .menu-item span {
        font-size: 16px;
    }
    
    .login-btn.logged-in {
        display: flex;
        align-items: center;
        gap: 5px;
    }
`;
document.head.appendChild(menuStyle);

function openLoginModal(e) {
    e.preventDefault();
    document.getElementById('loginModal').style.display = 'block';
}

// ===== HELPER FUNKCIJE =====
function isUserLoggedIn() {
    return window.authManager?.isAuthenticated() || false;
}

function getCurrentUser() {
    return window.authManager?.getCurrentUser() || null;
}

// Eksportuj globalne funkcije
window.showNotification = showNotification;
window.applyTheme = applyTheme;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;