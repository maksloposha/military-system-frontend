import {Message} from './message.model';

export interface Chat {
  id?: number;
  name: string;
  participants: string[];
  lastMessage: Message
  messages: Message[];
}
