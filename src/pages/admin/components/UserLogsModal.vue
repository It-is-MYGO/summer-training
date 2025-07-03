<template>
  <transition name="fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>用户日志 <span v-if="user">- {{ user.username }}</span></h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
        <div v-if="loading" class="loading-area">
          <div class="spinner"></div>
          <div style="color:#888;margin-top:10px;">正在加载日志...</div>
        </div>
        <template v-else>
          <div v-if="logs.length === 0" class="empty-cell">
            <img src="https://cdn.jsdelivr.net/gh/duogongneng/test-pic@main/empty-box.svg" alt="empty" class="empty-img" />
            <div style="color:#aaa;margin-top:8px;">暂无日志数据</div>
          </div>
          <div v-else class="log-list">
            <div class="log-card" v-for="log in logs" :key="log.id">
              <div class="log-row">
                <span class="log-label">时间</span>
                <span class="log-value">{{ log.created_at }}</span>
              </div>
              <div class="log-row">
                <span class="log-label">操作</span>
                <span class="log-value action-badge">
                  {{
                    log.action === 'login' ? '登录'
                    : log.action === 'register' ? '注册'
                    : log.action === 'ban' ? '封禁'
                    : log.action === 'logout' ? '登出'
                    : log.action
                  }}
                </span>
              </div>
              <div class="log-row">
                <span class="log-label">状态</span>
                <span class="log-value">
                  <span :class="['status-badge', log.status]">{{ log.status === 'success' ? '成功' : '失败' }}</span>
                </span>
              </div>
              <div class="log-row">
                <span class="log-label">IP</span>
                <span class="log-value">{{ formatIp(log.ip) }}</span>
              </div>
              <div class="log-row">
                <span class="log-label">UserAgent</span>
                <span class="log-value ua-cell">{{ log.user_agent }}</span>
              </div>
            </div>
          </div>
          <div class="pagination">
            <button class="btn btn-primary btn-sm" @click="prevPage" :disabled="page === 1">上一页</button>
            <span>第 {{ page }} / {{ totalPages }} 页</span>
            <button class="btn btn-primary btn-sm" @click="nextPage" :disabled="page === totalPages">下一页</button>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { getUserLogs } from '../../../api/log'

const props = defineProps({
  user: Object,
  show: Boolean
})

const logs = ref([])
const page = ref(1)
const pageSize = 5
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const loading = ref(false)

function formatIp(ip) {
  if (!ip) return '';
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
}

async function fetchLogs() {
  if (!props.user) return
  loading.value = true
  try {
    const res = await getUserLogs(props.user.id, page.value, pageSize)
    logs.value = res.data || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    fetchLogs()
  }
}
function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    fetchLogs()
  }
}

watch(() => props.user, () => {
  page.value = 1
  fetchLogs()
})
onMounted(fetchLogs)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px 32px 24px 32px;
  min-width: 700px;
  max-width: 90vw;
  box-shadow: 0 5px 24px rgba(67,97,238,0.10);
  position: relative;
  animation: popIn 0.3s;
}
@keyframes popIn {
  from { transform: scale(0.96); opacity: 0.7; }
  to { transform: scale(1); opacity: 1; }
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 18px;
}
.modal-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3a4b;
  margin: 0 auto;
}
.close-btn {
  position: absolute;
  right: 0;
  top: 0;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}
.close-btn:hover { color: #f72585; }

.log-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 10px;
  justify-content: flex-start;
}
.log-card {
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(67,97,238,0.04);
  padding: 18px 22px 12px 22px;
  min-width: 260px;
  max-width: 320px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 0;
  border: 1px solid #e9ecef;
  transition: box-shadow 0.2s;
}
.log-card:hover {
  box-shadow: 0 4px 16px rgba(67,97,238,0.10);
}
.log-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  padding: 0;
}
.log-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 70px;
}
.log-value {
  color: #2d3a4b;
  font-weight: 600;
  word-break: break-all;
  text-align: right;
}
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.95em;
  color: #fff;
}
.status-badge.success { background: #28a745; }
.status-badge.fail { background: #dc3545; }
.action-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  background: #e9ecef;
  color: #4361ee;
  font-weight: 600;
  font-size: 0.97em;
}
.ua-cell { max-width: 120px; word-break: break-all; }
.pagination {
  margin: 18px 0 0 0;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}
.spinner {
  width: 38px; height: 38px;
  border: 4px solid #e3e6f0;
  border-top: 4px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
.empty-cell {
  text-align: center;
  padding: 40px 0 20px 0;
  background: #fafbfc;
}
.empty-img {
  width: 80px;
  opacity: 0.7;
  margin-bottom: 6px;
}
@media (max-width: 1100px) {
  .modal-content { min-width: 500px; }
  .log-card { min-width: 180px; max-width: 100%; }
}
@media (max-width: 700px) {
  .modal-content { min-width: 0; padding: 12px; }
  .log-list { gap: 10px; }
  .log-card { padding: 10px 8px; }
  .ua-cell { max-width: 60px; }
}
</style>
