<template>
  <section class="search-results-page">
    <h2 class="section-title">搜索结果：{{ keyword }}</h2>
    <div class="products-grid">
      <div class="product-card" v-for="item in products" :key="item.id" @click="goToProduct(item.id)">
        <div class="product-image">
          <img :src="item.img || item.image || defaultImg" :alt="item.title || item.name" @error="onImgError" />
        </div>
        <div class="product-info">
          <div class="product-title">{{ item.title || item.name }}</div>
          <div class="product-price">{{ item.price }}</div>
          <div class="platform-tags" v-if="item.platforms">
            <span class="platform-tag" v-for="tag in item.platforms" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="products.length === 0" class="no-result">未找到相关商品</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const keyword = ref(route.query.keyword || '')
const products = ref([])
const defaultImg = '/default-product.png'

async function fetchProducts() {
  if (!keyword.value) return
  
  // 如果是收藏夹搜索，直接获取用户的收藏商品并过滤
  if (route.path.startsWith('/favorites/search')) {
    const userStr = localStorage.getItem('user')
    let userId = null
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr)
        userId = userObj.id
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }
    
    if (userId) {
      try {
        // 获取用户的所有收藏商品
        const favRes = await fetch(`/api/favorites?userId=${userId}`)
        const favData = await favRes.json()
        
        let favorites = []
        if (Array.isArray(favData)) {
          favorites = favData
        } else if (favData.code === 0 && Array.isArray(favData.data)) {
          favorites = favData.data
        } else {
          console.error('收藏数据格式错误:', favData)
          return
        }
        
        // 从收藏商品中筛选出匹配关键词的商品
        const filteredFavorites = favorites.filter(fav => {
          const title = fav.title || fav.name || ''
          const desc = fav.desc || ''
          const keyword = keyword.value.toLowerCase()
          return title.toLowerCase().includes(keyword) || 
                 desc.toLowerCase().includes(keyword)
        })
        
        products.value = filteredFavorites
        return
      } catch (error) {
        console.error('获取收藏商品失败:', error)
        products.value = []
        return
      }
    } else {
      // 用户未登录，跳转到登录页
      router.push('/login')
      return
    }
  }
  
  // 普通搜索：获取所有匹配的商品
  try {
    const res = await fetch(`/api/products/search?keyword=${encodeURIComponent(keyword.value)}`)
    const data = await res.json()
    let allProducts = []
    if (Array.isArray(data)) {
      allProducts = data
    } else if (data.code === 0 && Array.isArray(data.data)) {
      allProducts = data.data
    } else if (data.code === 0 && data.data && Array.isArray(data.data.products)) {
      allProducts = data.data.products
    } else {
      allProducts = []
    }
    products.value = allProducts
  } catch (error) {
    console.error('搜索商品失败:', error)
    products.value = []
  }
}

onMounted(fetchProducts)

function goToProduct(id) {
  if (!id) {
    alert('商品ID无效，无法跳转详情页');
    return;
  }
  router.push(`/product/${id}`)
}
function onImgError(e) {
  e.target.src = defaultImg
}
</script>

<style scoped>
.search-results-page {
  padding: 30px 0;
  min-height: 80vh;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.product-image {
  height: 180px;
  background-color: #f0f3f8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-image img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
.product-info {
  padding: 15px;
}
.product-title {
  font-weight: 600;
  margin-bottom: 8px;
  height: 40px;
  overflow: hidden;
}
.product-price {
  color: var(--warning);
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}
.platform-tags {
  display: flex;
  margin-top: 10px;
}
.platform-tag {
  background: var(--light-gray);
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.8rem;
  margin-right: 5px;
}
.no-result {
  text-align: center;
  color: var(--gray);
  margin-top: 40px;
  font-size: 1.2rem;
}
</style> 