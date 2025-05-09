export interface Message {
  chatId: number;
  sender: string;
  recipient: string;
  encryptedForSender: string,
  encryptedForRecipient: string,
  content: string;
  timestamp: Date;
}
