 import { Injectable } from '@angular/core';
import {Client, Message as StompMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import {Message} from './models/message.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private messageSubject = new Subject<any>();

  connect(): Observable<Message> {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient.subscribe('/user/queue/messages', (message: StompMessage) => {
          this.messageSubject.next(JSON.parse(message.body));
        });
      }
    });

    this.stompClient.activate();
    return this.messageSubject.asObservable();
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  sendMessage(recipient: string, content: Message): void {
    this.stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(content)
    });
  }
}
