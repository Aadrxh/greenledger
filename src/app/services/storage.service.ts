import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

const ENC_KEY = environment.encryptionKey || 'GreenLedger2025';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Saves a value to local storage after encrypting it.
   * We use AES encryption to keep the data safe from prying eyes.
   */
  setEncrypted(key: string, value: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, ENC_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error encrypting data:', error);
    }
  }

  /**
   * Retrieves a value from local storage and decrypts it.
   * If the key doesn't exist or decryption fails, it returns null.
   */
  getDecrypted(key: string): string | null {
    const enc = localStorage.getItem(key);
    if (!enc) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(enc, ENC_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }

  /**
   * Removes an item from local storage.
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
