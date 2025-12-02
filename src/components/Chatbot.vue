<template>
  <div class="chatbot-wrapper">
    <!-- Toggle Button -->
    <button class="chatbot-toggle" @click="isOpen = !isOpen" :class="{ active: isOpen }">
      <span class="toggle-icon">{{ isOpen ? '✕' : '💬' }}</span>
    </button>

    <!-- Chat Panel -->
    <transition name="chat-slide">
      <div v-if="isOpen" class="chatbot-panel">
        <div class="chat-header">
          <div class="header-info">
            <div class="bot-avatar">🤖</div>
            <div>
              <h4>AI 助手</h4>
              <span class="status-indicator">
                <span class="status-dot"></span>
                在线
              </span>
            </div>
          </div>
          <button class="close-btn" @click="isOpen = false">✕</button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-if="chatMessages.length === 0" class="welcome-message">
            <div class="welcome-icon">👋</div>
            <h4>欢迎使用 AI 助手</h4>
            <p>有什么可以帮助你的吗？</p>
          </div>
          
          <div 
            v-for="(msg, index) in chatMessages" 
            :key="index"
            class="message"
            :class="msg.sender"
          >
            <div class="message-avatar">
              {{ msg.sender === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ msg.text }}
              </div>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <div v-if="isTyping" class="message bot">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="message-bubble typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <form class="chat-input" @submit.prevent="sendMessage">
          <input 
            v-model="message" 
            placeholder="输入消息..." 
            :disabled="isTyping"
          />
          <button type="submit" :disabled="!message.trim() || isTyping">
            <span>发送</span>
          </button>
        </form>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      isOpen: false,
      message: '',
      chatMessages: [],
      isTyping: false
    };
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (!this.message.trim()) return;
      
      const userMessage = this.message;
      this.chatMessages.push({ 
        sender: 'user', 
        text: userMessage,
        timestamp: new Date()
      });
      this.message = '';
      this.scrollToBottom();

      this.isTyping = true;

      try {
        const response = await axios.post('http://localhost:3000/api/chatbot', { message: userMessage });
        const payload = response.data || {};

        const text =
          payload.response ??
          payload.data?.response ??
          payload.data?.text ??
          payload.data ??
          payload.detail ??
          (typeof payload === 'string' ? payload : JSON.stringify(payload));

        this.chatMessages.push({ 
          sender: 'bot', 
          text: String(text),
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error?.response?.data ?? error.message ?? error);
        const serverDetail = error?.response?.data?.detail || error?.response?.data || error.message;
        this.chatMessages.push({ 
          sender: 'bot', 
          text: '抱歉，出现了一些问题：' + String(serverDetail),
          timestamp: new Date()
        });
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    }
  }
};
</script>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

/* Toggle Button */
.chatbot-toggle {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition);
}

.chatbot-toggle:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.chatbot-toggle.active {
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
}

.toggle-icon {
  font-size: 1.5rem;
}

/* Chat Panel */
.chatbot-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 380px;
  max-height: 520px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bot-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 1.25rem;
}

.chat-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  opacity: 0.9;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 300px;
  max-height: 350px;
}

.welcome-message {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted);
}

.welcome-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.welcome-message h4 {
  margin: 0 0 0.375rem 0;
  color: var(--text);
}

.welcome-message p {
  margin: 0;
  font-size: 0.9rem;
}

.message {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: var(--primary-100);
}

.message-content {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  line-height: 1.5;
  word-break: break-word;
}

.message.bot .message-bubble {
  background: var(--bg-subtle);
  color: var(--text);
  border-bottom-left-radius: var(--radius-sm);
}

.message.user .message-bubble {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

.message-time {
  font-size: 0.7rem;
  color: var(--muted);
}

/* Typing Indicator */
.typing {
  display: flex;
  gap: 4px;
  padding: 1rem !important;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--muted);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

/* Input */
.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border);
  background: var(--bg-subtle);
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
}

.chat-input button {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-input button:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all var(--transition-slow);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive */
@media (max-width: 480px) {
  .chatbot-wrapper {
    bottom: 1rem;
    right: 1rem;
  }
  
  .chatbot-panel {
    width: calc(100vw - 2rem);
    right: -0.5rem;
    max-height: 70vh;
  }
}
</style>
