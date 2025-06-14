import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {concatMap, from, map, Subscription, switchMap, toArray} from 'rxjs';
import {ChatService} from '../../../chat-utils/chat-service';
import {WebSocketService} from '../../../chat-utils/chat-websocket-service';
import {Message} from '../../../chat-utils/models/message.model';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ChatEncryptionService} from '../../../chat-utils/chat-encryption-service';
import {Chat} from '../../../chat-utils/models/chat.model';
import {UserService} from '../../../services/user.service';
import {ConfirmDialogService} from '../../../utils/confirm-dialog/confirm-dialog.service';
import {TranslatePipe} from '../../../translate.pipe';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    DatePipe,
    NgIf,
    NgClass,
    FormsModule,
    TranslatePipe
  ],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  chatForm: FormGroup;
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  private wsSubscription!: Subscription;
  private messageSubscription!: Subscription;
  currentUser!: string;
  showNewChatModal = false;
  newChatRecipient = '';
  availableUsers: string[] = [];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;


  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private encryptionService: ChatEncryptionService,
    private userService: UserService,
    private confirmDialog: ConfirmDialogService
  ) {
    this.chatForm = this.fb.group({
      message: ['']
    });
    this.userService.getUserProfile().subscribe(user => {
      this.currentUser = user.username;
    });
  }


  ngOnInit(): void {
    this.wsSubscription = this.webSocketService.connect().subscribe((message: Message) => {

      if (this.selectedChat && this.selectedChat.messages) {
        this.encryptionService.decryptMessage(message.content).then(decryptedContent => {
          message.content = decryptedContent;

          if (!this.selectedChat!.messages) {
            this.selectedChat!.messages = [];
          }

          this.selectedChat!.messages.push(message);
          this.scrollToBottom();
        });
      }
    });

    this.messageSubscription = this.chatService.getChats().subscribe((chats: any[]) => {
      this.chats = chats;
      const savedChatId = localStorage.getItem('activeChatId');
      if (savedChatId) {
        const chat = chats.find(c => c.id == savedChatId);
        if (chat) {
          this.selectChat(chat);
        }
      }
    });

    this.chatService.getAvailableUsers().subscribe(users => {
      this.availableUsers = users.filter(u => u !== this.currentUser);
    });

  }

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    this.loadMessages(this.selectedChat);
  }

  createNewChat(): void {
    this.showNewChatModal = true;
  }

  confirmNewChat(): void {
    if (!this.newChatRecipient) return;

    const newChat: Chat = {
      name: `Chat between ${this.newChatRecipient} and ${this.currentUser}`,
      participants: [this.currentUser, this.newChatRecipient],
      messages: [],
      lastMessage: {content: 'New chat created', timestamp: new Date()} as Message
    };

    this.chats.push(newChat);
    this.chatService.createNewChat(newChat).subscribe(() => {
      console.log('New chat created successfully');
    }, error => {
      console.error('Error creating new chat:', error);
    });
    this.selectChat(newChat);
    this.showNewChatModal = false;
    this.newChatRecipient = '';
  }

  cancelNewChat(): void {
    this.showNewChatModal = false;
    this.newChatRecipient = '';
  }


  async sendMessage() {
    if (this.chatForm.invalid || !this.selectedChat) {
      console.log("Form is invalid or no chat selected");
      return;
    }

    const rawMessage = this.chatForm.value.message.trim();
    if (!rawMessage) return;

    const recipient = this.selectedChat.participants.find((p: string) => p !== this.currentUser);
    const recipientPublicJWK = await this.chatService.fetchRecipientPublicKey(recipient!);
    const recipientPublicKey = await this.encryptionService.importPublicKey(recipientPublicJWK!);

    const senderPublicJWK = await this.encryptionService.getPublicKey();
    const senderPublicKey = await this.encryptionService.importPublicKey(senderPublicJWK!);


    const encryptedForRecipient = await this.encryptionService.encryptMessage(rawMessage, recipientPublicKey);
    const encryptedForSender = await this.encryptionService.encryptMessage(rawMessage, senderPublicKey);

    this.chatService.sendMessage(recipient!, <Message>{
      chatId: this.selectedChat.id,
      sender: this.currentUser,
      recipient: recipient,
      encryptedForRecipient: encryptedForRecipient,
      encryptedForSender: encryptedForSender,
      timestamp: new Date()
    });

    this.chatForm.reset();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    if (this.messageSubscription) this.messageSubscription.unsubscribe();

    if (this.selectedChat) {
      localStorage.setItem('activeChatId', this.selectedChat.id?.toString() ?? '');
    }

  }

  loadMessages(chat: Chat) {
    this.selectedChat = {...chat, messages: []};

    const otherParticipant = chat.participants.find(participant => participant !== this.currentUser);

    this.chatService.fetchMessages(otherParticipant!).pipe(
      switchMap(messages => {

        return from(messages).pipe(
          concatMap(msg => {

            return from(this.encryptionService.decryptMessage(msg.content)).pipe(
              map(decryptedContent => ({
                ...msg,
                content: decryptedContent,
                timestamp: new Date(msg.timestamp)
              }))
            );
          }),
          toArray()
        );
      })
    ).subscribe(decryptedMessages => {
      if (this.selectedChat) {
        this.selectedChat.messages = decryptedMessages;
        this.scrollToBottom();
      }
    });
  }


  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll failed', err);
    }
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  async deleteChat(chat: Chat) {
    const confirmed = await this.confirmDialog.open(
      `Are you sure you want to delete chat "${chat.name}"?`,
      'Delete',
      'Cancel'
    );
    if (!confirmed) return;

    this.chats = this.chats.filter(c => c !== chat);

    if (this.selectedChat === chat) {
      this.selectedChat = null;
    }

    this.chatService.deleteChat(chat!.id!).subscribe(() => {
      console.log('Chat deleted successfully');
    }, error => {
      console.error('Error deleting chat:', error);
    });
  }


}
