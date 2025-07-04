    <template>
      <div class="main-container">
        <h1>修改个人信息</h1>
        <form @submit.prevent="saveChanges">
          <div class="form-group">
            <label for="username">用户名:</label>
            <input type="text" id="username" v-model="user.username" disabled>
          </div>
          <div class="form-group">
            <label for="email">邮箱:</label>
            <input type="email" id="email" v-model="user.email" required>
          </div>
          <div class="form-group">
            <label for="newPassword">新密码:</label>
            <input type="password" id="newPassword" v-model="newPassword">
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认新密码:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword">
          </div>
          <div class="actions">
            <button type="submit">保存修改</button>
            <button type="button" @click="cancel">取消</button>
          </div>
        </form>
        <nav class="main-nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/profile" class="nav-link">个人中心</router-link>
          <button @click="logout" class="logout-btn">退出</button>
        </nav>
      </div>
    </template>

    <script setup>
    import axios from 'axios'
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const user = ref({})
    const newPassword = ref('')
    const confirmPassword = ref('')

    function getUser() {
      const u = localStorage.getItem('user')
      user.value = u ? JSON.parse(u) : {}
    }

    function saveChanges() {
      if (newPassword.value && newPassword.value !== confirmPassword.value) {
        alert('两次输入的密码不一致')
        return
      }

      const updateData = {
        email: user.value.email
      }

      if (newPassword.value) {
        updateData.password = newPassword.value
      }

      const token = localStorage.getItem('token')
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      axios.put('/api/auth/profile', updateData, config)
        .then(res => {
          alert('修改成功')
          // 更新localStorage中的用户信息
          localStorage.setItem('user', JSON.stringify(user.value))
          router.push('/profile')
        })
        .catch(err => {
          console.error('更新用户信息失败', err)
          alert('修改失败，请稍后再试')
        })
    }

    function cancel() {
      router.push('/profile')
    }

    function logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('loginStatusChanged'))
      router.push('/login')
    }

    onMounted(() => {
      getUser()
    })
    </script>

    <style scoped>
    .main-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 0;
    }

    h1 {
      color: #1e293b;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px 0 rgba(34, 51, 84, 0.12);
      padding: 30px;
      width: 100%;
      max-width: 500px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #475569;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      color: #1e293b;
      transition: all 0.3s ease;
      background: #f8fafc;
    }

    .form-group input:focus {
      outline: none;
      border-color: #6366f1;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .form-group input:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
    }

    .actions {
      display: flex;
      gap: 16px;
      margin-top: 30px;
    }

    .actions button {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .actions button[type="submit"] {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #fff;
      border: none;
    }

    .actions button[type="submit"]:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .actions button[type="button"] {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .actions button[type="button"]:hover {
      background: #e2e8f0;
      color: #475569;
    }

    .main-nav {
      margin-top: 30px;
      display: flex;
      gap: 16px;
    }

    .nav-link {
      padding: 8px 16px;
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: #eff6ff;
    }

    .logout-btn {
      padding: 8px 16px;
      background: #fee2e2;
      color: #ef4444;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: #fecaca;
    }

    @media (max-width: 480px) {
      form {
        padding: 24px;
      }

      .actions {
        flex-direction: column;
      }
    }
    </style>
  