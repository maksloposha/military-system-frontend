// chat-encryption.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PublicKey } from './models/public-key.model';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatEncryptionService {
  private keyPair: CryptoKeyPair | null = null;

  constructor(private http: HttpClient) {}

  /** Основний метод. Завантаження ключа з сервера або генерація. */
  async initKeys(password: string): Promise<void> {
    const stored = await this.downloadEncryptedPrivateKey();
    if (stored) {
      this.keyPair = await this.decryptPrivateKeyAndLoadPair(stored, password);
    } else {
      this.keyPair = await this.generateKeyPair();
      await this.encryptAndUploadPrivateKey(this.keyPair.privateKey, password);
      await this.uploadMyPublicKey(this.keyPair.publicKey);
    }
  }

  /** Генерація нової пари ключів */
  private async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /** Шифрування приватного ключа паролем та завантаження на сервер */
  private async encryptAndUploadPrivateKey(privateKey: CryptoKey, password: string): Promise<void> {
    const jwk = await crypto.subtle.exportKey('jwk', privateKey);
    const jwkStr = JSON.stringify(jwk);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKeyFromPassword(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(jwkStr)
    );

    const payload = {
      ciphertext: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt)
    };

    await this.http.post(`${environment.apiUrl}/api/keys/encrypted`, payload, { withCredentials: true }).toPromise();
  }

  /** Завантажити зашифрований приватний ключ із сервера */
  private async downloadEncryptedPrivateKey(): Promise<{ ciphertext: string; salt: string; iv: string } | null> {
    try {
      return await this.http.get<any>(`${environment.apiUrl}/api/keys/encrypted`, { withCredentials: true }).toPromise();
    } catch {
      return null;
    }
  }

  /** Дешифрувати приватний ключ та отримати публічний з бекенду */
  private async decryptPrivateKeyAndLoadPair(data: { ciphertext: string; salt: string; iv: string }, password: string): Promise<CryptoKeyPair> {
    const key = await this.deriveKeyFromPassword(password, this.base64ToArrayBuffer(data.salt));
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.base64ToArrayBuffer(data.iv) },
      key,
      this.base64ToArrayBuffer(data.ciphertext)
    );
    const jwk = JSON.parse(new TextDecoder().decode(decrypted));
    const privateKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt']
    );
    const publicKey = await this.loadPublicKeyFromServer();
    return { privateKey, publicKey };
  }

  /** Отримати ключ шифрування з пароля (PBKDF2 + AES-GCM) */
  private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100_000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /** Отримати публічний ключ поточного користувача */
  async getPublicKey(): Promise<JsonWebKey> {
    if (!this.keyPair) throw new Error('Key pair not initialized');
    return await window.crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
  }

  /** Зашифрувати повідомлення */
  async encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<string> {
    const encoded = new TextEncoder().encode(message);
    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, recipientPublicKey, encoded);
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /** Розшифрувати повідомлення */
  async decryptMessage(encryptedBase64: string): Promise<string> {
    if (!this.keyPair?.privateKey) throw new Error('Private key not initialized');
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.keyPair.privateKey,
      encryptedBytes
    );
    return new TextDecoder().decode(decrypted);
  }

  /** Імпортувати чужий публічний ключ */
  async importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
  }

  /** Отримати чужий публічний ключ по username */
  getRecipientPublicKey(username: string) {
    return this.http.get<PublicKey>(`${environment.apiUrl}/api/keys/${username}`, { withCredentials: true }).pipe(
      map(res => JSON.parse(res.jwk))
    );
  }

  /** Завантажити публічний ключ поточного користувача */
  private async loadPublicKeyFromServer(): Promise<CryptoKey> {
    const res = await this.http.get<PublicKey>(`${environment.apiUrl}/api/keys/me`, { withCredentials: true }).toPromise();
    return this.importPublicKey(JSON.parse(res!.jwk));
  }

  /** Завантажити мій публічний ключ */
  private async uploadMyPublicKey(publicKey: CryptoKey): Promise<void> {
    const jwk = await crypto.subtle.exportKey('jwk', publicKey);
    await this.http.post(`${environment.apiUrl}/api/keys`, { jwk: JSON.stringify(jwk) }, { withCredentials: true }).toPromise();
  }

  /** Helpers */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  }
}
