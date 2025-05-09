// Cleaned ChatService
import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject, of} from 'rxjs';
import {Message} from './models/message.model';
import {WebSocketService} from './chat-websocket-service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Chat} from './models/chat.model';

@Injectable({providedIn: 'root'})
export class ChatService {
  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  constructor(private webSocketService: WebSocketService, private http: HttpClient) {
  }

  getMessages(): Observable<Message[]> {
    return this.messagesSubject.asObservable();
  }

  getChats(): Observable<any[]> {
     return this.http.get<string[]>(`${environment.apiUrl}/api/chat/getChatsForCurrentUser`, {withCredentials: true});
  }

  async fetchRecipientPublicKey(username: string): Promise<JsonWebKey | null> {
    try {
      const data = await this.http.get<{
        jwk: string
      }>(`${environment.apiUrl}/api/keys/${username}`, {withCredentials: true}).toPromise();

      if (data?.jwk) {
        return JSON.parse(data.jwk);
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch public key:', error);
      return null;
    }
  }


  sendMessage(recipient: string, message: Message): void {
    this.webSocketService.sendMessage(recipient, message);
  }

  fetchMessages(recipient: string): Observable<Message[]> {
    console.log(`Fetching messages for recipient: ${recipient}`);
    return this.http.get<Message[]>(`${environment.apiUrl}/api/chat/getMessages/${recipient}`, {withCredentials: true});
  }

  getAvailableUsers(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/api/chat/availableUsers`, {withCredentials: true}); // змініть URL за потреби
  }

  createNewChat(chat: Chat): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/chat/createChat`, {name: chat.name, lastMessage: chat.lastMessage.content, participants: chat.participants}, {withCredentials: true});
  }

}
