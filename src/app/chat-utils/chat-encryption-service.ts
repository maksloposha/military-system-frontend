// chat-encryption.service.ts
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {PublicKey} from './models/public-key.model';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class ChatEncryptionService {
  private keyPair: CryptoKeyPair | null = null;

  constructor(private http: HttpClient) {
    this.loadOrGenerateKeys();
  }

  private async loadOrGenerateKeys(): Promise<void> {
    const existing = localStorage.getItem('privateKey');
    if (existing) {
      try {
        const privateKey = await window.crypto.subtle.importKey(
          'jwk',
          JSON.parse(existing),
          {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
          },
          true,
          ['decrypt']
        );
        const publicKey = await this.loadPublicKeyFromServer();
        this.keyPair = {privateKey, publicKey};
      } catch (e) {
        console.error('Failed to load private key:', e);
        localStorage.removeItem('privateKey');
        await this.loadOrGenerateKeys(); // retry
      }
    } else {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );

      const jwk = await window.crypto.subtle.exportKey('jwk', this.keyPair.privateKey);
      localStorage.setItem('privateKey', JSON.stringify(jwk));

      const exportedPub = await window.crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
      this.uploadMyPublicKey(exportedPub).subscribe();
    }
  }

  public async getPublicKey(): Promise<JsonWebKey> {
    if (!this.keyPair) throw new Error('KeyPair not ready');
    return await window.crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
  }

  public async encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<string> {
    const encoded = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      {name: 'RSA-OAEP'},
      recipientPublicKey,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  public async decryptMessage(encryptedBase64: string): Promise<string> {
    try {
      if (!this.keyPair) throw new Error('KeyPair not initialized');
      if (!this.keyPair.privateKey) throw new Error('Private key not initialized');

      console.log('Decrypting with private key:', this.keyPair.privateKey); // Логування privateKey

      const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
      console.log('Encrypted Bytes:', encryptedBytes); // Логування перетворених байтів

      // Підготовка шифрування
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        this.keyPair.privateKey,
        encryptedBytes
      );

      // Декодуємо результат
      const decoded = new TextDecoder().decode(decrypted);
      console.log('Decrypted Content:', decoded); // Логування розшифрованого контенту
      return decoded;
    } catch (error) {
      console.error('Decryption error:', error); // Логування помилки
      throw new Error('Decryption failed');
    }
  }



  private async loadPublicKeyFromServer(): Promise<CryptoKey> {
    const publicKeyRes = await this.http.get<PublicKey>(`${environment.apiUrl}/api/keys/me`, {withCredentials: true}).toPromise();
    const jwk = JSON.parse(publicKeyRes!.jwk);
    return await this.importPublicKey(jwk);
  }

  public async importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {name: 'RSA-OAEP', hash: 'SHA-256'},
      true,
      ['encrypt']
    );
  }

  getRecipientPublicKey(username: string): Observable<JsonWebKey> {
    return this.http.get<PublicKey>(`${environment.apiUrl}/api/keys/${username}`, {withCredentials: true}).pipe(
      map(res => JSON.parse(res.jwk))
    );
  }

  uploadMyPublicKey(jwk: JsonWebKey): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/keys`, {jwk: JSON.stringify(jwk)}, {withCredentials: true});
  }
}
