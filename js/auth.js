

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }
    
   
    loadCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
        }
    }
    
 
    async register(userData) {
        try {
        
            if (!this.validateRegistration(userData)) {
                throw new Error('Validacija nije uspjela');
            }
            
       
            const users = this.getAllUsers();
            
       
            if (users.find(u => u.email === userData.email)) {
                throw new Error('Email već postoji!');
            }
            
          
            const newUser = {
                id: this.generateUserId(),
                name: userData.name,
                email: userData.email,
                password: this.hashPassword(userData.password), 
                theme: userData.theme || 'default',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                enabledModules: this.getDefaultModules(),
                settings: this.getDefaultSettings()
            };
            
         
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            
            this.setCurrentUser(newUser);
            
          
            this.initializeUserData(newUser.id);
            
            return {
                success: true,
                user: newUser,
                message: 'Registracija uspješna!'
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
 
    async login(email, password) {
        try {
      
            const users = this.getAllUsers();
            
    
            const user = users.find(u => 
                u.email === email && 
                u.password === this.hashPassword(password)
            );
            
            if (!user) {
                throw new Error('Pogrešan email ili lozinka!');
            }
            
    
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);
            
          
            this.setCurrentUser(user);
            
            return {
                success: true,
                user: user,
                message: 'Prijava uspješna!'
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        return {
            success: true,
            message: 'Odjava uspješna!'
        };
    }
    
    
    validateRegistration(data) {
        if (!data.name || data.name.length < 3) {
            throw new Error('Ime mora imati najmanje 3 karaktera');
        }
        
        if (!this.isValidEmail(data.email)) {
            throw new Error('Nevažeća email adresa');
        }
        
        if (!data.password || data.password.length < 6) {
            throw new Error('Lozinka mora imati najmanje 6 karaktera');
        }
        
        if (data.password !== data.confirmPassword) {
            throw new Error('Lozinke se ne podudaraju');
        }
        
        if (!data.theme) {
            throw new Error('Molimo odaberite temu');
        }
        
        return true;
    }
    
  
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
  
    hashPassword(password) {
     
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
 
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getAllUsers() {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : [];
    }
    

    updateUser(updatedUser) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            
           
            if (this.currentUser && this.currentUser.id === updatedUser.id) {
                this.setCurrentUser(updatedUser);
            }
        }
    }
    
   
    setCurrentUser(user) {
        this.currentUser = user;
        
       
        const userToStore = { ...user };
        delete userToStore.password;
        
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
    }
    

    getDefaultModules() {
        return [
            'habits',
            'sleep',
            'study',
            'water',
            'mood',
            'tasks',
            'calendar'
        ];
    }
    
   
    getDefaultSettings() {
        return {
            notifications: true,
            darkMode: false,
            language: 'bs',
            dateFormat: 'DD.MM.YYYY',
            timeFormat: '24h',
            weekStart: 'monday'
        };
    }
    
    
    initializeUserData(userId) {
       
        const trackerData = {
            habits: [],
            sleep: [],
            study: [],
            water: [],
            mood: [],
            tasks: [],
            meals: [],
            fitness: [],
            finance: [],
            gratitude: [],
            reflection: []
        };
        
        localStorage.setItem(`userData_${userId}`, JSON.stringify(trackerData));
    }
    

    getUserData(userId) {
        const dataJson = localStorage.getItem(`userData_${userId}`);
        return dataJson ? JSON.parse(dataJson) : null;
    }
    

    saveUserData(userId, data) {
        localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
    }
    

    async changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            return {
                success: false,
                message: 'Niste prijavljeni'
            };
        }
        
        try {
            const users = this.getAllUsers();
            const user = users.find(u => u.id === this.currentUser.id);
            
            if (!user) {
                throw new Error('Korisnik nije pronađen');
            }
            
            if (user.password !== this.hashPassword(oldPassword)) {
                throw new Error('Pogrešna stara lozinka');
            }
            
            if (newPassword.length < 6) {
                throw new Error('Nova lozinka mora imati najmanje 6 karaktera');
            }
            
            user.password = this.hashPassword(newPassword);
            this.updateUser(user);
            
            return {
                success: true,
                message: 'Lozinka uspješno promijenjena!'
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    

    async updateProfile(updates) {
        if (!this.currentUser) {
            return {
                success: false,
                message: 'Niste prijavljeni'
            };
        }
        
        try {
            const users = this.getAllUsers();
            const user = users.find(u => u.id === this.currentUser.id);
            
            if (!user) {
                throw new Error('Korisnik nije pronađen');
            }
            
        
            if (updates.name) user.name = updates.name;
            if (updates.theme) user.theme = updates.theme;
            if (updates.settings) user.settings = { ...user.settings, ...updates.settings };
            if (updates.enabledModules) user.enabledModules = updates.enabledModules;
            
            this.updateUser(user);
            
            return {
                success: true,
                user: user,
                message: 'Profil uspješno ažuriran!'
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    
 
    async deleteAccount(password) {
        if (!this.currentUser) {
            return {
                success: false,
                message: 'Niste prijavljeni'
            };
        }
        
        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => 
                u.id === this.currentUser.id && 
                u.password === this.hashPassword(password)
            );
            
            if (userIndex === -1) {
                throw new Error('Pogrešna lozinka');
            }
            
            
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            
           
            localStorage.removeItem(`userData_${this.currentUser.id}`);
            
           
            this.logout();
            
            return {
                success: true,
                message: 'Nalog uspješno obrisan'
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    
   
    async resetPassword(email) {
        try {
            const users = this.getAllUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                throw new Error('Email nije pronađen');
            }
            
        
            console.log('Password reset requested for:', email);
            
            return {
                success: true,
                message: 'Link za reset lozinke je poslan na email'
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    
   
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
  
    getCurrentUser() {
        if (!this.currentUser) return null;
        
        const user = { ...this.currentUser };
        delete user.password;
        return user;
    }
}


window.authManager = new AuthManager();


if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}


function showAuthMessage(message, type = 'info') {
    if (window.IPIAkademija && window.IPIAkademija.showNotification) {
        window.IPIAkademija.showNotification(message, type);
    } else {
        alert(message);
    }
}


function redirectToDashboard() {

    

    window.open('http://localhost:4200/dashboard', '_blank');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}


function requireAuth() {
    if (!window.authManager.isAuthenticated()) {
        showAuthMessage('Morate biti prijavljeni da pristupite ovoj stranici', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    return true;
}


function applyUserTheme() {
    const currentUser = window.authManager.getCurrentUser();
    if (currentUser && currentUser.theme) {
        if (window.IPIAkademija && window.IPIAkademija.applyTheme) {
            window.IPIAkademija.applyTheme(currentUser.theme);
        }
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUserTheme);
} else {
    applyUserTheme();
}

console.log('Auth Manager initialized 🔐');
