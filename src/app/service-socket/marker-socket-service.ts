import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MarkerSocketService {
  private stompClient: Client;
  private markerSubject = new BehaviorSubject<any>(null);

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient.subscribe('/topic/markers', (message: IMessage) => {
          const body = JSON.parse(message.body);
          console.log('Received update:', body);
          this.markerSubject.next(body);
        });
      }
    });

    this.stompClient.activate();
  }

  public get markerUpdates$() {
    return this.markerSubject.asObservable();
  }
}
