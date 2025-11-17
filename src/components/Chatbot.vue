<template>
  <div class="chatbot-container">
    <div class="chat-box">
      <div class="chat-message" v-for="(msg, index) in chatMessages" :key="index">
        <div :class="msg.sender === 'user' ? 'user-message' : 'bot-message'">
          {{ msg.text }}
        </div>
      </div>
    </div>
    <input v-model="message" @keyup.enter="sendMessage" placeholder="Type a message..." />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      message: '',
      chatMessages: []
    };
  },
  methods: {
    async sendMessage() {
      if (!this.message) return;
      this.chatMessages.push({ sender: 'user', text: this.message });

      try {
        const response = await axios.post('http://localhost:3000/api/chatbot', { message: this.message });
        const payload = response.data || {};

        // tolerate multiple shapes
        const text =
          payload.response ??
          payload.data?.response ??
          payload.data?.text ??
          payload.data ??
          payload.detail ??
          (typeof payload === 'string' ? payload : JSON.stringify(payload));

        this.chatMessages.push({ sender: 'bot', text: String(text) });
        this.message = '';
      } catch (error) {
        console.error('Error sending message:', error?.response?.data ?? error.message ?? error);
        const serverDetail = error?.response?.data?.detail || error?.response?.data || error.message;
        this.chatMessages.push({ sender: 'bot', text: 'Sorry, something went wrong: ' + String(serverDetail) });
      }
    }
  }
};
</script>

<style scoped>
.chatbot-container {
  width: 400px;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-box {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.chat-message {
  margin: 5px 0;
}

.user-message {
  text-align: right;
  background-color: #e1f5fe;
  padding: 8px;
  border-radius: 5px;
}

.bot-message {
  text-align: left;
  background-color: #f1f1f1;
  padding: 8px;
  border-radius: 5px;
}

input {
  width: 80%;
  padding: 8px;
  margin-right: 10px;
  border-radius: 5px;
}

button {
  padding: 8px;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  border: none;
}
</style>
