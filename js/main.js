
document.addEventListener('DOMContentLoaded', function() {
    

    initNavigation();
    initScrollEffects();
    initContactForm();
    initThemeSwitcher();
    applyUserTheme();
    
    console.log('IPI Akademija initialized successfully!');
});


function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
 
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
   
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerOffset = 80;
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
    
   
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - 100)) {
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


function initScrollEffects() {
    const header = document.querySelector('.header');
    
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
    });
    
    
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




function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            
            showNotification('Hvala! Vaša poruka je poslana. Odgovorit ćemo vam uskoro! ✉️', 'success');
            
            
            contactForm.reset();
            
            
            console.log('Contact form submitted:', data);
        });
    }
    
    
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            if (email) {
                showNotification('Uspješno ste se prijavili na newsletter! 📧', 'success');
                form.reset();
                console.log('Newsletter subscription:', email);
            }
        });
    });
}




function initThemeSwitcher() {
    
    if (!document.querySelector('.theme-switcher')) {
        createThemeSwitcher();
    }
    
    const themeSwitcher = document.querySelector('.theme-switcher');
    const themeMenu = document.querySelector('.theme-menu');
    
    if (themeSwitcher && themeMenu) {
        themeSwitcher.addEventListener('click', () => {
            themeMenu.classList.toggle('active');
        });
        
        
        document.addEventListener('click', (e) => {
            if (!themeSwitcher.contains(e.target) && !themeMenu.contains(e.target)) {
                themeMenu.classList.remove('active');
            }
        });
        
        
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                applyTheme(theme);
                themeMenu.classList.remove('active');
            });
        });
    }
}

function createThemeSwitcher() {
    
    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.innerHTML = '🎨';
    switcher.title = 'Promijeni temu';
    
    
    const menu = document.createElement('div');
    menu.className = 'theme-menu';
    menu.innerHTML = `
        <div class="theme-option" data-theme="default">
            <div class="theme-color-preview" style="background: linear-gradient(135deg, #667eea, #764ba2)"></div>
            <span>Defaultna</span>
        </div>
        <div class="theme-option" data-theme="green">
            <div class="theme-color-preview"></div>
            <span>🌿 Zelena</span>
        </div>
        <div class="theme-option" data-theme="blue">
            <div class="theme-color-preview"></div>
            <span>💙 Plava</span>
        </div>
        <div class="theme-option" data-theme="pink">
            <div class="theme-color-preview"></div>
            <span>🌸 Roza</span>
        </div>
        <div class="theme-option" data-theme="orange">
            <div class="theme-color-preview"></div>
            <span>🔥 Narandžasta</span>
        </div>
        <div class="theme-option" data-theme="dark">
            <div class="theme-color-preview"></div>
            <span>🌙 Dark</span>
        </div>
        <div class="theme-option" data-theme="cyberpunk">
            <div class="theme-color-preview"></div>
            <span>⚡ Cyberpunk</span>
        </div>
    `;
    
    document.body.appendChild(switcher);
    document.body.appendChild(menu);
}

function applyTheme(themeName) {
    const body = document.body;
    
    
    const themes = ['green-theme', 'blue-theme', 'pink-theme', 'orange-theme', 'dark-theme', 'cyberpunk-theme'];
    themes.forEach(theme => body.classList.remove(theme));
    
    
    if (themeName !== 'default') {
        body.classList.add(`${themeName}-theme`);
    }
    
    
    body.classList.add('theme-changing');
    setTimeout(() => {
        body.classList.remove('theme-changing');
    }, 500);
    
    
    localStorage.setItem('selectedTheme', themeName);
    
    
    const themeNames = {
        'default': 'Defaultna',
        'green': 'Zelena 🌿',
        'blue': 'Plava 💙',
        'pink': 'Roza 🌸',
        'orange': 'Narandžasta 🔥',
        'dark': 'Dark 🌙',
        'cyberpunk': 'Cyberpunk ⚡'
    };
    
    showNotification(`Tema promijenjena u: ${themeNames[themeName]}`, 'info');
}

function applyUserTheme() {
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser && currentUser.theme) {
        applyTheme(currentUser.theme);
    } else {
        
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            applyTheme(savedTheme);
        }
    }
}




function showNotification(message, type = 'info') {
    
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    
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
        animation: 'slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s',
        maxWidth: '300px'
    });
    
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


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






function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function isUserLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}


function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}


function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Uspješno ste se odjavili!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}


function updateNavigation() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && isUserLoggedIn()) {
        const user = getCurrentUser();
        loginBtn.textContent = `👤 ${user.name}`;
        loginBtn.href = 'http://localhost:4200/dashboard';
        loginBtn.target = '_blank';
    }
}


updateNavigation();






if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
}




window.IPIAkademija = {
    showNotification,
    applyTheme,
    getCurrentUser,
    isUserLoggedIn,
    logout
};
