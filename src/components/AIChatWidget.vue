<template>
  <div>
    <!-- 悬浮按钮 -->
    <div
      class="ai-widget-fab"
      :style="{ right: fabPos.x + 'px', bottom: fabPos.y + 'px', background: 'var(--primary)' }"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
      v-if="!open"
    >
      <span style="font-size:22px;vertical-align:middle;">🤖</span>
      <span class="ai-fab-text">AI助手</span>
    </div>
    <!-- 聊天对话框 -->
    <transition name="fade">
      <div
        class="ai-chat-dialog"
        v-if="open"
        :style="{ right: fabPos.x + 'px', bottom: fabPos.y + 'px' }"
      >
        <div
          class="ai-chat-header"
          :style="{ background: 'var(--primary)', color: '#fff', cursor: 'move' }"
          @mousedown="onMouseDown"
          @touchstart="onTouchStart"
        >
          <span>智谱AI 聊天</span>
          <button class="close-btn" @click="open = false">×</button>
        </div>
        <div class="chat-messages" ref="msgList">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['chat-msg', msg.role]"
          >
            <div
              :class="['msg-main', msg.role === 'user' ? 'user-main' : '']"
            >
              <span :class="['msg-nick', msg.role === 'ai' ? 'ai-nick' : 'user-nick']">
                {{ msg.role === 'ai' ? '智谱AI' : (currentUser?.username || '我') }}
              </span>
              <div :class="['msg-content', msg.role === 'ai' ? 'ai-content' : 'user-content']">
                {{ msg.content }}
              </div>
            </div>
            <span
              :class="['avatar', msg.role === 'ai' ? 'ai-avatar' : 'user-avatar']"
            >
              <template v-if="msg.role === 'ai'">🤖</template>
              <template v-else>
                <img
                  v-if="getAvatarUrl(currentUser)"
                  :src="getAvatarUrl(currentUser)"
                  :alt="currentUser.username"
                  @error="handleAvatarError"
                />
                <span v-else>
                  {{ currentUser && currentUser.username ? currentUser.username.charAt(0).toUpperCase() : '?' }}
                </span>
              </template>
            </span>
          </div>
          <div v-if="loading" class="chat-msg ai">
            <span class="avatar ai-avatar">🤖</span>
            <div class="msg-main">
              <span class="msg-nick ai-nick">智谱AI</span>
              <div class="msg-content ai-content">生成中...</div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <input
            v-model="input"
            @keyup.enter="sendMsg"
            @keyup.esc="open = false"
            placeholder="请输入你的问题..."
            :disabled="loading"
          />
          <button @click="sendMsg" :disabled="loading || !input.trim()">发送</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { aiChat } from '@/api/ai'

const open = ref(false)
const messages = ref([
  { role: 'ai', content: '你好，我是智谱AI，有什么可以帮您？' }
])
const input = ref('')
const loading = ref(false)
const msgList = ref(null)
const currentUser = ref(null)

// 悬浮按钮/对话框可拖动
const fabPos = ref({ x: 32, y: 32 })
let dragging = false
let dragStart = { x: 0, y: 0 }
let mouseStart = { x: 0, y: 0 }
let moved = false

function onMouseDown(e) {
  dragging = true
  moved = false
  dragStart = { x: fabPos.value.x, y: fabPos.value.y }
  mouseStart = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
function onMouseMove(e) {
  if (!dragging) return
  const dx = e.clientX - mouseStart.x
  const dy = e.clientY - mouseStart.y
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true
  fabPos.value.x = Math.max(0, dragStart.x - dx)
  fabPos.value.y = Math.max(0, dragStart.y - dy)
}
function onMouseUp(e) {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  if (!moved && !open.value) open.value = true // 只要不是拖动，就是点击
  dragging = false
}

function onTouchStart(e) {
  dragging = true
  moved = false
  dragStart = { x: fabPos.value.x, y: fabPos.value.y }
  mouseStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  document.addEventListener('touchmove', onTouchMove)
  document.addEventListener('touchend', onTouchEnd)
}
function onTouchMove(e) {
  if (!dragging) return
  const dx = e.touches[0].clientX - mouseStart.x
  const dy = e.touches[0].clientY - mouseStart.y
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true
  fabPos.value.x = Math.max(0, dragStart.x - dx)
  fabPos.value.y = Math.max(0, dragStart.y - dy)
}
function onTouchEnd(e) {
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
  if (!moved && !open.value) open.value = true
  dragging = false
}

const sendMsg = async () => {
  if (!input.value.trim() || loading.value) return
  messages.value.push({ role: 'user', content: input.value })
  loading.value = true
  const userMsg = input.value
  input.value = ''
  await nextTick(() => {
    msgList.value.scrollTop = msgList.value.scrollHeight
  })
  try {
    const res = await aiChat(userMsg)
    messages.value.push({ role: 'ai', content: res.reply || 'AI未回复' })
  } catch (e) {
    messages.value.push({ role: 'ai', content: 'AI服务异常，请稍后再试。' })
  }
  loading.value = false
  await nextTick(() => {
    msgList.value.scrollTop = msgList.value.scrollHeight
  })
}

function getAvatarUrl(user) {
  if (user && user.avatar) {
    if (user.avatar.startsWith('http')) {
      return user.avatar
    }
    return 'http://localhost:3000' + user.avatar
  }
  return 'https://picsum.photos/seed/user/40/40'
}

function handleAvatarError(event) {
  event.target.style.display = 'none'
}

// ESC键关闭对话框
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') open.value = false
  })
  currentUser.value = JSON.parse(localStorage.getItem('user') || '{}')
})
</script>

<style scoped>
.ai-widget-fab {
  position: fixed;
  z-index: 9999;
  border-radius: 50px;
  padding: 14px 24px;
  font-size: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}
.ai-fab-text {
  color: #fff;
  font-size: 18px;
  margin-left: 6px;
  font-weight: 500;
  vertical-align: middle;
}
.ai-widget-fab:active {
  filter: brightness(0.95);
}
.ai-chat-dialog {
  position: fixed;
  width: 350px;
  max-height: 520px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  z-index: 10000;
  animation: popin 0.2s;
}
@keyframes popin {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  border-radius: 12px 12px 0 0;
  cursor: move;
  user-select: none;
}
.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #fff;
  transition: color 0.2s;
}
.close-btn:hover { color: #f56c6c; }
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafbfc;
}
.chat-msg {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.chat-msg.ai {
  flex-direction: row;
  justify-content: flex-start;
}
.chat-msg.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(67,97,238,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  overflow: hidden;
  margin: 0 8px;
  flex-shrink: 0;
}
.ai-avatar {
  left: 0;
}
.user-avatar {
  right: 0;
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e9ecef;
  display: block;
}
.msg-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 75%;
}
.user-main {
  align-items: flex-end;
}
.chat-msg.ai .msg-main {
  margin-left: 54px;
  margin-right: 0;
  width: 100%;
}
.msg-header {
  margin-bottom: 2px;
}
.msg-nick {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}
.ai-nick {
  color: #f72585;
}
.user-nick {
  color: #4361ee;
}
.msg-content {
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 16px;
  line-height: 1.7;
  word-break: break-all;
  box-shadow: 0 2px 8px rgba(67,97,238,0.06);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  max-width: 320px;
}
.ai-content {
  background: var(--primary);
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.user-content {
  background: #e6f0fd;
  color: #222;
}
.chat-input {
  display: flex;
  border-top: 1px solid #eee;
  padding: 10px;
  background: #fff;
  border-radius: 0 0 12px 12px;
}
.chat-input input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  font-size: 15px;
  margin-right: 8px;
}
.chat-input button {
  padding: 8px 18px;
  border: none;
  background: var(--primary);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}
.chat-input button:disabled {
  background: #bbb;
  cursor: not-allowed;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
