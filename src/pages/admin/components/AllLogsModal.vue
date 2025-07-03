<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>所有用户实时日志</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <table class="admin-table log-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>用户ID</th>
            <th>操作</th>
            <th>状态</th>
            <th>IP</th>
            <th>UserAgent</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="6" class="empty-cell">
              <img src="https://cdn.jsdelivr.net/gh/duogongneng/test-pic@main/empty-box.svg" alt="empty" class="empty-img" />
              <div style="color:#aaa;margin-top:8px;">暂无日志数据</div>
            </td>
          </tr>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.created_at }}</td>
            <td>{{ log.user_id }}</td>
            <td>
              <span class="action-badge" :class="actionClass(log.action)">
                {{
                  log.action === 'login' ? '登录'
                  : log.action === 'register' ? '注册'
                  : log.action === 'ban' ? '封禁'
                  : log.action === 'logout' ? '登出'
                  : log.action
                }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', log.status]">{{ log.status === 'success' ? '成功' : '失败' }}</span>
            </td>
            <td>{{ formatIp(log.ip) }}</td>
            <td class="ua-cell">{{ log.user_agent }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button class="btn btn-primary btn-sm" @click="prevPage" :disabled="page === 1">上一页</button>
        <span>第 {{ page }} / {{ totalPages }} 页</span>
        <button class="btn btn-primary btn-sm" @click="nextPage" :disabled="page === totalPages">下一页</button>
        <button class="btn btn-secondary btn-sm" @click="fetchLogs">刷新</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllLogs } from '../../../api/log'

const logs = ref([])
const page = ref(1)
const pageSize = 3
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function formatIp(ip) {
  if (!ip) return '';
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
}

function actionClass(action) {
  switch (action) {
    case 'login': return 'action-login'
    case 'register': return 'action-register'
    case 'logout': return 'action-logout'
    case 'ban': return 'action-ban'
    default: return ''
  }
}

async function fetchLogs() {
  const res = await getAllLogs(page.value, pageSize)
  logs.value = res.data || []
  total.value = res.total || 0
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

onMounted(fetchLogs)
</script>

<style scoped>
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
  min-width: 900px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(67,97,238,0.10);
  position: relative;
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
.admin-table.log-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(67,97,238,0.04);
  margin-bottom: 0;
}
.admin-table.log-table th, .admin-table.log-table td {
  padding: 13px 12px;
  font-size: 1rem;
}
.admin-table.log-table th {
  background: #f8f9fa;
  color: #2d3a4b;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
}
.admin-table.log-table td {
  border-bottom: 1px solid #e9ecef;
  color: #2d3a4b;
  text-align: center;
  vertical-align: middle;
}
.admin-table.log-table tr:last-child td {
  border-bottom: none;
}
.admin-table.log-table tr:hover {
  background-color: rgba(67, 97, 238, 0.03);
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
  padding: 2px 14px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.97em;
  margin: 0 2px;
  min-width: 48px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(67,97,238,0.06);
  transition: background 0.2s, color 0.2s;
}

/* 登录：蓝色 */
.action-badge.action-login {
  background: #e3eafe;
  color: #2563eb;
  border: 1px solid #b6d0fe;
}

/* 注册：黄色 */
.action-badge.action-register {
  background: #fff7e0;
  color: #b8860b;
  border: 1px solid #ffe082;
}

/* 登出：红色 */
.action-badge.action-logout {
  background: #ffeaea;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}

/* 封禁：紫色/灰色 */
.action-badge.action-ban {
  background: #ede7f6;
  color: #6c63ff;
  border: 1px solid #b39ddb;
}
.ua-cell { max-width: 180px; word-break: break-all; }
.pagination {
  margin: 18px 0 0 0;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
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
</style>
