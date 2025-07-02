<template>
  <section class="all-products-page">
    <h2 class="section-title">全部商品</h2>
    <div class="products-grid">
      <div class="product-card" v-for="item in products" :key="item.id" @click="goToProduct(item.id)">
        <div class="product-image">
          <img :src="item.img || item.image || defaultImg" :alt="item.title || item.name" @error="onImgError" />
        </div>
        <div class="product-info">
          <div class="product-title">{{ item.title || item.name }}</div>
        </div>
      </div>
    </div>
    <div class="pagination">
      <button :disabled="page === 1" @click="prevPage">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page === totalPages" @click="nextPage">下一页</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const page = ref(1)
const pageSize = 12
const total = ref(0)
const totalPages = ref(1)
const defaultImg = '/default-product.png'

async function fetchProducts() {
  const res = await fetch(`/api/products/all?page=${page.value}&pageSize=${pageSize}`)
  const data = await res.json()
  if (data.code === 0) {
    products.value = data.data.products
    total.value = data.data.total
    totalPages.value = Math.ceil(total.value / pageSize)
  }
}

onMounted(fetchProducts)
watch(page, fetchProducts)

function prevPage() {
  if (page.value > 1) page.value--
}
function nextPage() {
  if (page.value < totalPages.value) page.value++
}
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
.all-products-page {
  padding: 30px 0;
  min-height: 80vh;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 30px;
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
.pagination {
  margin: 30px 0 0 0;
  text-align: center;
}
.pagination button {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  margin: 0 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 