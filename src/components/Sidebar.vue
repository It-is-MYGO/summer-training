<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <i class="fas fa-balance-scale"></i>
    </div>
    <ul class="sidebar-links">
      <li>
        <router-link to="/" class="sidebar-link" active-class="active" exact title="首页">
          <i class="fas fa-home"></i>
          <span>首页</span>
        </router-link>
      </li>
      <li>
        <router-link :to="isLoggedIn ? '/profile' : '/login'" class="sidebar-link" :title="isLoggedIn ? '个人中心' : '用户登录'">
          <i class="fas fa-user-check"></i>
          <span>{{ isLoggedIn ? '个人中心' : '用户登录' }}</span>
        </router-link>
      </li>
      <li>
        <router-link to="/favorites" class="sidebar-link" active-class="active" title="收藏夹">
          <i class="fas fa-heart"></i>
          <span>收藏夹</span>
        </router-link>
      </li>
      <li>
        <router-link to="/square" class="sidebar-link" active-class="active" title="动态广场">
          <i class="fas fa-comments"></i>
          <span>动态广场</span>
        </router-link>
      </li>
      <li>
        <router-link to="/my-dynamic" class="sidebar-link" active-class="active" title="动态">
          <i class="fas fa-bullhorn"></i>
          <span>动态</span>
        </router-link>
      </li>
      <li>
        <router-link to="/collections" class="sidebar-link" active-class="active" title="动态收藏">
          <i class="fas fa-bookmark"></i>
          <span>动态收藏</span>
        </router-link>
      </li>
      <li>
        <router-link to="/chart" class="sidebar-link" active-class="active" title="图表">
          <i class="fas fa-chart-line"></i>
          <span>图表</span>
        </router-link>
      </li>
      <li v-if="isadmin">
        <router-link to="/admin" class="sidebar-link" title="管理员后台">
          <i class="fas fa-user-cog"></i>
          <span>管理员后台</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const isLoggedIn = ref(false)
const isadmin = ref(false)
function checkLoginStatus() {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  isLoggedIn.value = !!(token && userStr)
  const user = userStr ? JSON.parse(userStr) : {}
  isadmin.value = !!user && Number(user.isadmin) === 1
}
onMounted(() => {
  checkLoginStatus()
  window.addEventListener('storage', checkLoginStatus)
  window.addEventListener('loginStatusChanged', checkLoginStatus)
})
onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus)
  window.removeEventListener('loginStatusChanged', checkLoginStatus)
})
</script>

<style scoped>
:root {
  --primary: #4361ee;
  --secondary: #3f37c9;
  --light: #f8f9fa;
  --dark: #212529;
  --gray: #6c757d;
  --light-gray: #e9ecef;
}
.sidebar {
  width: 80px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 200;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
  border-radius: 18px;
}
.sidebar-logo {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  font-size: 2.2rem;
  color: #ffe066;
}
.sidebar-top-links {
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  align-items: center;
  margin-bottom: 24px;
}
.sidebar-top-link, .sidebar-link {
  width: 100%;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  font-size: 1.15rem;
  border-radius: 10px 0 0 10px;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  padding: 0;
}
.sidebar-top-link i, .sidebar-link i {
  font-size: 1.4rem;
  margin-bottom: 4px;
}
.sidebar-top-link span, .sidebar-link span {
  font-size: 0.85rem;
}
.sidebar-top-link.active, .sidebar-top-link:hover,
.sidebar-link.active, .sidebar-link:hover {
  background: rgba(255,255,255,0.15);
  color: #ffe066;
  transform: scale(1.05);
}
.sidebar-links {
  list-style: none;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
@media (max-width: 900px) {
  .sidebar {
    width: 60px;
  }
  .sidebar-top-link span, .sidebar-link span {
    display: none;
  }
}
</style>