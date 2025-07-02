<template>
  <div class="admin-header">
    <div class="admin-title">{{ title }}</div>
    <ul class="admin-nav">
      <li :class="{active: $route.path === '/admin/products'}" @click="$router.push('/admin/products')">
        <i class="fas fa-shopping-bag"></i> 商品管理
      </li>
      <li :class="{active: $route.path === '/admin/brands'}" @click="$router.push('/admin/brands')">
        <i class="fas fa-tags"></i> 品牌管理
      </li>
      <li :class="{active: $route.path === '/admin/posts'}" @click="$router.push('/admin/posts')">
        <i class="fas fa-comments"></i> 动态管理
      </li>
      <li :class="{active: $route.path === '/admin/users'}" @click="$router.push('/admin/users')">
        <i class="fas fa-users"></i> 用户管理
      </li>
      <li :class="{active: $route.path === '/admin/charts'}" @click="$router.push('/admin/charts')">
        <i class="fas fa-chart-pie"></i> 图表分析
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AdminHeader',
  data() {
    return {
      showDropdown: false,
      title: '管理员控制台',
      searchValue: ''
    }
  },
  computed: {
    isAdminModule() {
      const adminPaths = [
        '/admin/products',
        '/admin/brands',
        '/admin/posts',
        '/admin/users',
        '/admin/charts'
      ];
      return adminPaths.includes(this.$route.path);
    }
  },
  watch: {
    $route() {
      this.updateTitle()
    }
  },
  mounted() {
    this.updateTitle()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showDropdown = false
      }
    },
    logout() {
      // 退出登录逻辑
      this.$router.push('/')
    },
    updateTitle() {
      const routeMap = {
        '/admin/products': '商品管理',
        '/admin/brands': '品牌管理',
        '/admin/posts': '动态管理',
        '/admin/users': '用户管理',
        '/admin/charts': '图表分析'
      }
      this.title = routeMap[this.$route.path] || '管理员控制台'
    }
  }
}
</script>

<style scoped>
.admin-header {
  height: 60px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  z-index: 99;
  position: relative;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
  margin-right: 30px;
}

.admin-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 18px;
}
.admin-nav li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 1rem;
  color: var(--gray);
  transition: background 0.2s, color 0.2s;
}
.admin-nav li.active, .admin-nav li:hover {
  background: var(--primary);
  color: #fff;
}
.admin-nav li i {
  margin-right: 6px;
}

.admin-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.admin-user {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: var(--primary);
  font-weight: bold;
}

.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .admin-nav {
    gap: 8px;
  }
  .admin-title {
    font-size: 1.1rem;
    margin-right: 10px;
  }
}
@media (max-width: 768px) {
  .admin-header {
    padding: 0 10px;
  }
  .admin-title {
    font-size: 1rem;
  }
  .admin-nav li {
    font-size: 0.9rem;
    padding: 6px 8px;
  }
}
</style>