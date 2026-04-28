import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConnectionStatus } from '../../../../core/services/websocket.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.scss',
})
export class MessageInput {
  disabled = input(false);
  connectionStatus = input<ConnectionStatus>('disconnected');

  messageSent = output<string>();

  messageText = '';

  onSend(): void {
    if (!this.messageText.trim() || this.disabled()) return;

    this.messageSent.emit(this.messageText.trim());
    this.messageText = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
