import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import {ZoneEvent} from './zone-event';

@Injectable({ providedIn: 'root' })
export class ZoneSocketService {
  private stompClient: Client;
  private zoneSubject = new BehaviorSubject<any>(null);

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient.subscribe('/topic/zones', (message: IMessage) => {
          const body: ZoneEvent = JSON.parse(message.body);
          this.zoneSubject.next(body);
        });
      }
    });

    this.stompClient.activate();
  }

  public get zoneUpdates$() {
    return this.zoneSubject.asObservable();
  }
}
