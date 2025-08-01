<template>
  <!-- 首页搜索栏和锚点导航合并为一行 -->
  <div class="home-top-bar">
    <div class="home-search-bar-inline">
      <input v-model="searchKeyword" @keyup.enter="onSearch" placeholder="搜索商品名称或描述..." class="search-input" />
      <button @click="onSearch" class="search-btn">搜索</button>
    </div>
    <nav class="home-anchor-nav-inline">
      <button @click="scrollTo('brands')">品牌专区</button>
      <button @click="scrollTo('hot')">今日热门</button>
      <button @click="scrollTo('drop')">近期降价</button>
    </nav>
  </div>
  <section class="page-content">
    <div class="main-container">
      <!-- 快速入口区域 -->
      <div class="quick-access">
        <h2 class="section-title">
          <i class="fas fa-rocket"></i> 快速入口
        </h2>
        <div class="quick-links">
          <router-link to="/square" class="quick-link">
            <div class="quick-link-icon">
              <i class="fas fa-bullhorn"></i>
            </div>
            <div class="quick-link-text">
              <h3>我的动态</h3>
              <p>查看和管理您的动态</p>
            </div>
          </router-link>
          <router-link to="/square" class="quick-link">
            <div class="quick-link-icon">
              <i class="fas fa-comments"></i>
            </div>
            <div class="quick-link-text">
              <h3>动态广场</h3>
              <p>浏览所有用户动态</p>
            </div>
          </router-link>
          <router-link to="/favorites" class="quick-link">
            <div class="quick-link-icon">
              <i class="fas fa-heart"></i>
            </div>
            <div class="quick-link-text">
              <h3>收藏夹</h3>
              <p>查看收藏的商品</p>
            </div>
          </router-link>
          <router-link to="/chart" class="quick-link">
            <div class="quick-link-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="quick-link-text">
              <h3>价格图表</h3>
              <p>查看价格趋势</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 查看全部商品按钮 -->
      <div style="text-align:center; margin: 30px 0;">
        <button class="view-all-btn" @click="goToAllProducts">查看全部商品</button>
      </div>

      <!-- 品牌专栏 -->
      <h2 class="section-title" id="brands">
        <i class="fas fa-tags"></i> 品牌专栏
      </h2>
      <div class="brands-grid" v-if="brands.length > 0">
        <div 
          class="brand-card" 
          v-for="brand in pagedBrands" 
          :key="brand.id" 
          @click="goToBrand(brand.id)"
        >
          <div class="brand-info">
            <h3 class="brand-name">{{ brand.name }}</h3>
            <p class="brand-count">{{ brand.product_count }} 件商品</p>
          </div>
          <div class="brand-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
      <!-- 品牌专栏分页条 -->
      <div class="pagination" v-if="totalBrandsPages > 1">
        <div 
          class="page-item" 
          v-for="page in getBrandsPaginationPages" 
          :key="page" 
          :class="{active: brandsPage === page, ellipsis: page === '...'}"
          @click="handleBrandsPageChange(page)"
        >
          {{ page }}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-left: 16px;">
          <input v-model.number="brandsPageInput" type="number" min="1" :max="totalBrandsPages" placeholder="页码" style="width: 60px; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;" @keyup.enter="jumpToBrandsPage" />
          <button class="btn btn-outline btn-sm" @click="jumpToBrandsPage">跳转</button>
        </div>
      </div>

      <!-- 推荐商品 -->
      <h2 class="section-title">为你推荐</h2>
      <div class="products-grid">
        <div class="product-card" v-for="item in recommendProducts" :key="item.id" @click="goToProduct(item.id)" style="cursor:pointer;">
          <div class="product-image">
            <img :src="item.img || item.image || defaultImg" :alt="item.title || item.name" @error="onImgError" />
          </div>
          <div class="product-info">
            <div class="product-title">{{ item.title || item.name }}</div>
          </div>
        </div>
      </div>

      <h2 class="section-title" id="hot">今日热门商品</h2>
      <div class="products-grid">
        <div class="product-card" v-for="item in hotProducts" :key="item.id" @click="goToProduct(item.id)" style="cursor:pointer;">
          <div class="product-image">
            <img :src="item.img || item.image || defaultImg" :alt="item.title" @error="onImgError" />
          </div>
          <div class="product-info">
            <div class="product-title">{{ item.title }}</div>
            <div class="product-price">{{ item.price }}</div>
            <div class="platform-tags">
              <span class="platform-tag" v-for="tag in item.platforms" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
      <h2 class="section-title" style="margin-top: 40px;" id="drop">近期降价商品</h2>
      <div class="products-grid">
        <div class="product-card" v-for="item in dropProducts" :key="item.id" @click="goToProduct(item.id)" style="cursor:pointer;">
          <div class="product-image">
            <img :src="item.img || item.image || defaultImg" :alt="item.title" @error="onImgError" />
          </div>
          <div class="product-info">
            <div class="product-title">{{ item.title }}</div>
            <div class="product-price">{{ item.price }} <span v-if="item.oldPrice" style="text-decoration: line-through; color: var(--gray); font-size: 0.9rem;">{{ item.oldPrice }}</span></div>
            <div class="platform-tags">
              <span class="platform-tag" v-for="tag in item.platforms" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hotProducts = ref([])
const dropProducts = ref([])
const brands = ref([])
const brandsLoading = ref(true)
const recommendProducts = ref([])
const defaultImg = '/default-product.png'
const searchKeyword = ref('')
const brandsPage = ref(1)
const brandsPageSize = 12
const brandsPageInput = ref('')

const totalBrandsPages = computed(() => Math.ceil(brands.value.length / brandsPageSize) || 1)
const pagedBrands = computed(() => {
  const start = (brandsPage.value - 1) * brandsPageSize
  return brands.value.slice(start, start + brandsPageSize)
})
const getBrandsPaginationPages = computed(() => {
  const pages = []
  const total = totalBrandsPages.value
  const current = brandsPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = current; i <= current + 4; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  }
  return pages
})

onMounted(async () => {
  // 品牌列表
  try {
    const brandsRes = await fetch('/api/products/brands')
    const brandsResult = await brandsRes.json()
    if (brandsResult.code === 0) {
      brands.value = brandsResult.data
    }
  } catch (error) {
    console.error('获取品牌列表失败:', error)
  } finally {
    brandsLoading.value = false
  }

  // 推荐商品
  try {
    // 尝试多种可能的键名
    let userId = localStorage.getItem('userId') || 
                 localStorage.getItem('user_id') || 
                 localStorage.getItem('id') || 
                 localStorage.getItem('user')
    // 如果userId是JSON字符串，解析并提取id
    if (userId && typeof userId === 'string') {
      try {
        const userObj = JSON.parse(userId)
        if (userObj && userObj.id) {
          userId = userObj.id.toString()
        }
      } catch (e) {
        // 如果不是JSON，保持原值
      }
    }
    // 如果没有userId，使用默认用户ID 1
    if (!userId) {
      userId = '1'
    }
    if (userId) {
      const recRes = await fetch(`/api/recommend/user/${userId}`)
      const recResult = await recRes.json()
      if (recResult.code === 0) {
        recommendProducts.value = recResult.data
      }
    }
  } catch (error) {}

  // 热门商品
  const hotRes = await fetch('/api/products/hot')
  hotProducts.value = await hotRes.json()

  // 降价商品
  const dropRes = await fetch('/api/products/drops')
  dropProducts.value = await dropRes.json()
})

function goToProduct(id) {
  if (!id) {
    alert('商品ID无效，无法跳转详情页');
    return;
  }
  router.push(`/product/${id}`)
}

function goToBrand(brandId) {
  router.push(`/brand/${brandId}`)
}

function onImgError(e) {
  e.target.src = defaultImg
}

function goToAllProducts() {
  router.push('/products')
}

function onSearch() {
  if (!searchKeyword.value.trim()) return
  router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`)
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function handleBrandsPageChange(page) {
  if (page === '...') return
  if (page !== brandsPage.value && page > 0 && page <= totalBrandsPages.value) {
    brandsPage.value = page
  }
}

function jumpToBrandsPage() {
  const page = Number(brandsPageInput.value)
  if (page && page > 0 && page <= totalBrandsPages.value) {
    brandsPage.value = page
    brandsPageInput.value = ''
  } else {
    alert('请输入有效的页码（1-' + totalBrandsPages.value + '）')
  }
}
</script>

<style scoped>
/* 首页特有样式 */
.page-content {
  padding: 30px 0;
  min-height: calc(100vh - 150px);
}

/* 快速入口样式 */
.quick-access {
  margin-bottom: 40px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-top: 20px;
}

.quick-link {
  display: flex;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.quick-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  color: var(--primary);
}

.quick-link-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 1.5rem;
}

.quick-link-text h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--dark);
}

.quick-link-text p {
  font-size: 0.9rem;
  color: var(--gray);
  margin: 0;
}

/* 其他首页样式 */
.section-title {
  font-size: 1.8rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--light-gray);
  color: var(--primary);
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 10px;
}

/* 品牌专栏样式 */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.brand-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  color: var(--primary);
}

.brand-info {
  flex: 1;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: var(--dark);
}

.brand-count {
  font-size: 0.9rem;
  color: var(--gray);
  margin: 0;
}

.brand-arrow {
  color: var(--gray);
  transition: all 0.3s ease;
}

.brand-card:hover .brand-arrow {
  color: var(--primary);
  transform: translateX(3px);
}

.brands-loading {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray);
}

.brands-loading i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--light-gray);
}

.brands-loading p {
  margin: 0;
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
.price-change {
  font-size: 0.9rem;
  padding: 3px 8px;
  border-radius: 10px;
  display: inline-block;
}
.price-up {
  background-color: rgba(255, 0, 0, 0.1);
  color: #e74c3c;
}
.price-down {
  background-color: rgba(0, 200, 83, 0.1);
  color: #00c853;
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

@media (max-width: 1200px) {
  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
@media (max-width: 700px) {
  .quick-links {
    grid-template-columns: 1fr;
  }
  
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .brand-card {
    padding: 15px;
  }
  
  .brand-name {
    font-size: 1rem;
  }
}

.view-all-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
}
.view-all-btn:hover {
  background: var(--secondary);
}

.home-top-bar {
  position: sticky;
  top: 0;
  z-index: 102;
  background: #fff;
  box-shadow: 0 2px 8px rgba(80,120,255,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 18px 0 12px 0;
}
.home-search-bar-inline {
  display: flex;
  align-items: center;
  gap: 0;
  border: 2px solid var(--primary);
  border-radius: 10px;
  background: #fff;
  padding: 4px 8px;
}
.home-anchor-nav-inline {
  display: flex;
  align-items: center;
  gap: 18px;
}
.home-anchor-nav-inline button {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(80,120,255,0.08);
  transition: background 0.2s;
}
.home-anchor-nav-inline button:hover {
  background: var(--secondary);
}

.pagination {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.page-item {
  padding: 8px 14px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid var(--light-gray);
  color: var(--primary);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
  margin: 0 2px;
  user-select: none;
}
.page-item.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.page-item.ellipsis {
  cursor: default;
  color: #bbb;
  background: none;
  box-shadow: none;
  pointer-events: none;
  border: none;
}
</style>
