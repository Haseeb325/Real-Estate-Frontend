import { Component } from '@angular/core';
import { ChatInbox } from '../../../../shared/components/chat-inbox/chat-inbox';

@Component({
  selector: 'app-chats',
  imports: [ChatInbox],
  templateUrl: './chats.html',
  styleUrl: './chats.scss',
})
export class Chats {}
