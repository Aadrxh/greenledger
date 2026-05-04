import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { Store } from '@ngrx/store';
import { loadExpenses } from '../store/expense/expense.actions';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private storage = inject(StorageService);
  private store = inject(Store);

  user$ = authState(this.auth).pipe(
    tap(fbUser => {
      if (fbUser) {
        console.log('User authenticated, dispatching loadExpenses... 🟢');
        this.store.dispatch(loadExpenses());
      }
    }),
    switchMap(fbUser => {
      if (!fbUser) return of(null);
      return from(this.getUserProfile(fbUser.uid));
    })
  );

  async getUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
    return userDoc.exists() ? userDoc.data() as User : null;
  }

  /**
   * Logs in the user and sets a timestamp. 
   * We store the login time so we can automatically log them out 
   * after 24 hours (security first! 🛡️).
   */
  async login(email: string, pass: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, pass);
    // Setting the 24h flag - this is our way of keeping the session fresh
    this.storage.setEncrypted('login_flag', Date.now().toString());
    return cred;
  }

  /**
   * Creates a new user profile in Firestore.
   * Every new user starts as a 'member'. Only manually changing 
   * the database can make someone an 'admin'.
   */
  async signup(email: string, pass: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, pass);
    const user: User = {
      uid: cred.user.uid,
      email,
      displayName,
      role: 'member', 
      createdAt: new Date().toISOString()
    };
    // We save the user profile separately so we can store extra info like roles
    await setDoc(doc(this.firestore, `users/${cred.user.uid}`), user);
    this.storage.setEncrypted('login_flag', Date.now().toString());
    return cred;
  }

  async logout() {
    await signOut(this.auth);
    this.storage.removeItem('login_flag');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      const flag = this.storage.getDecrypted('login_flag');
      if (!flag) {
        resolve(false);
        return;
      }

      const loginTime = parseInt(flag, 10);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - loginTime > twentyFourHours) {
        this.logout();
        resolve(false);
        return;
      }

      // Check if Firebase already has a user or wait for it to initialize
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }
}
