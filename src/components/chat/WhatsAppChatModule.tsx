'use client';

// Backwards compatibility re-export shim for WhatsAppChatModule -> PulseChatModule
import PulseChatModule, { WhatsAppChatModule } from './PulseChatModule';

export * from './PulseChatModule';
export { WhatsAppChatModule };
export default PulseChatModule;
