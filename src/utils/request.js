import axios from 'axios';
import router from '../router';

const service = axios.create({
  baseURL: '/api', // 根据实际后端代理配置调整
  timeout: 5000
});

// 请求拦截器，自动加 token
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 防止多次跳转登录页
let isRedirecting = false;

// 响应拦截器，未登录或token过期自动跳转
service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (!isRedirecting) {
        isRedirecting = true;
        // 可选：弹窗提示
        alert('登录已过期，请重新登录');
        router.push('/user/login').finally(() => {
          isRedirecting = false;
        });
      }
    }
    return Promise.reject(error);
  }
);

export default service; 