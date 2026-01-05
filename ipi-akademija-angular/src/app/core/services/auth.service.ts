import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  user,
  User,
  updateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  theme: string;
  createdAt: Date;
  lastLogin: Date;
  enabledModules: string[];
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  theme: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  user$ = user(this.auth);
  currentUser = signal<UserData | null>(null);

  constructor() {
    this.user$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        this.loadUserData(firebaseUser.uid);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: UserData }> {
    try {
      if (!this.validateRegistration(data)) {
        throw new Error('Validacija nije uspjela');
      }

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      await updateProfile(user, { displayName: data.name });

      const userData: UserData = {
        uid: user.uid,
        name: data.name,
        email: data.email,
        theme: data.theme || 'default',
        createdAt: new Date(),
        lastLogin: new Date(),
        enabledModules: this.getDefaultModules()
      };

      await setDoc(doc(this.firestore, 'users', user.uid), userData);
      await this.initializeUserData(user.uid);

      this.currentUser.set(userData);

      return {
        success: true,
        user: userData,
        message: 'Registracija uspješna!'
      };

    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserData }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateDoc(doc(this.firestore, 'users', user.uid), {
        lastLogin: new Date()
      });

      const userData = await this.loadUserData(user.uid);

      return {
        success: true,
        user: userData,
        message: 'Prijava uspješna!'
      };

    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.router.navigate(['/']);
      
      return {
        success: true,
        message: 'Odjava uspješna!'
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Greška pri odjavi'
      };
    }
  }

  async loadUserData(uid: string): Promise<UserData> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      this.currentUser.set(data);
      return data;
    }
    
    throw new Error('User data not found');
  }

  validateRegistration(data: RegisterData): boolean {
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getDefaultModules(): string[] {
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

  async initializeUserData(uid: string): Promise<void> {
    const trackerData = {
      habits: [],
      sleep: [],
      study: [],
      water: [],
      mood: [],
      tasks: []
    };

    await setDoc(doc(this.firestore, 'userTrackerData', uid), trackerData);
  }

  async getUserData(uid: string): Promise<any> {
    const dataDoc = await getDoc(doc(this.firestore, 'userTrackerData', uid));
    return dataDoc.exists() ? dataDoc.data() : null;
  }

  async updateUserData(uid: string, data: any): Promise<void> {
    await updateDoc(doc(this.firestore, 'userTrackerData', uid), data);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser(): UserData | null {
    return this.currentUser();
  }

  // metode za postavke
  async updateUserProfile(updates: Partial<UserData>): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
   
      await updateDoc(doc(this.firestore, 'users', user.uid), updates);
      
      
      this.currentUser.set({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }


  async deleteUserAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const firebaseUser = this.auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      const uid = firebaseUser.uid;

   
      const userDocRef = doc(this.firestore, 'users', uid);
      const trackerDocRef = doc(this.firestore, 'userTrackerData', uid);
      
      await deleteDoc(userDocRef);
      await deleteDoc(trackerDocRef);
      

      await firebaseUser.delete();
      
  
      this.currentUser.set(null);
      
      return {
        success: true,
        message: 'Nalog je uspješno obrisan'
      };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email već postoji!';
      case 'auth/invalid-email':
        return 'Nevažeća email adresa!';
      case 'auth/weak-password':
        return 'Lozinka je previše slaba!';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Pogrešan email ili lozinka!';
      case 'auth/too-many-requests':
        return 'Previše pokušaja. Pokušajte ponovo kasnije.';
      case 'auth/requires-recent-login':
        return 'Molimo prijavite se ponovo da potvrdite akciju.';
      default:
        return error.message || 'Došlo je do greške';
    }
  }
}