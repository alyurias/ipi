

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }
    
    // Učitaj trenutnog korisnika iz localStorage
    loadCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
        }
    }
    
    // REGISTRACIJA
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
                enabledModules: this.getDefaultModules()
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
    
    // LOGIN
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
    
    // LOGOUT
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        return {
            success: true,
            message: 'Odjava uspješna!'
        };
    }
    
    // VALIDACIJA REGISTRACIJE
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
    
    // EMAIL VALIDACIJA
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // HASH LOZINKE 
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    // GENERIŠI ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    

    getAllUsers() {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : [];
    }
    
    // AŽURIRAJ KORISNIKA
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
    
    // POSTAVI TRENUTNOG KORISNIKA
    setCurrentUser(user) {
        this.currentUser = user;
        const userToStore = { ...user };
        delete userToStore.password; // Ne čuvaj lozinku u currentUser
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
    }
    
    // DEFAULT MODULI
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
    
    // INICIJALIZUJ USER DATA
    initializeUserData(userId) {
        const trackerData = {
            habits: [],
            sleep: [],
            study: [],
            water: [],
            mood: [],
            tasks: []
        };
        
        localStorage.setItem(`userData_${userId}`, JSON.stringify(trackerData));
    }
    
    // DOBAVI USER DATA
    getUserData(userId) {
        const dataJson = localStorage.getItem(`userData_${userId}`);
        return dataJson ? JSON.parse(dataJson) : null;
    }
    
    // SAČUVAJ USER DATA
    saveUserData(userId, data) {
        localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
    }
    
    // DA LI JE PRIJAVLJEN
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // DOBAVI TRENUTNOG KORISNIKA
    getCurrentUser() {
        if (!this.currentUser) return null;
        
        const user = { ...this.currentUser };
        delete user.password;
        return user;
    }
}

// Inicijalizuj globalni authManager
window.authManager = new AuthManager();

// Helper funkcija za prikaz poruka
function showAuthMessage(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}

console.log('Auth Manager initialized 🔐');