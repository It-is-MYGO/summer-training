<template>
  <div class="content-page">
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">品牌管理</h2>
        <div>
          <input v-model="searchKeyword" placeholder="搜索品牌名..." @keyup.enter="fetchBrands" class="search-input" />
          <button class="btn btn-primary" @click="fetchBrands">搜索</button>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary" @click="showAddDialog = true">新增品牌</button>
        </div>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>品牌名</th>
            <th>Logo</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="brand in brands" :key="brand.id">
            <td>{{ brand.id }}</td>
            <td>{{ brand.name }}</td>
            <td>
              <img :src="brand.logo" alt="logo" style="height:32px;" />
            </td>
            <td>
              <button class="btn btn-primary btn-sm" @click="editBrand(brand)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="deleteBrand(brand.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button :disabled="page === 1" @click="page--">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
        <button :disabled="page === totalPages" @click="page++">下一页</button>
      </div>
      <!-- 新增/编辑品牌弹窗 -->
      <div v-if="showAddDialog || editingBrand" class="dialog-mask" @click.self="closeDialog">
        <div class="dialog">
          <h3>{{ editingBrand ? '编辑品牌' : '新增品牌' }}</h3>
          <input v-model="brandForm.name" placeholder="品牌名" />
          <input v-model="brandForm.logo" placeholder="Logo URL" />
          <div>
            <button class="btn btn-primary" @click="saveBrand">保存</button>
            <button class="btn btn-outline" @click="closeDialog">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

const brands = ref([])
const showAddDialog = ref(false)
const editingBrand = ref(null)
const brandForm = ref({ name: '', logo: '' })
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
const searchKeyword = ref('')

const fetchBrands = async () => {
  const res = await axios.get('/api/brands/paged', { params: { page: page.value, pageSize: pageSize.value, keyword: searchKeyword.value } })
  brands.value = res.data.data
  total.value = Number(res.data.total) || 0
}

onMounted(fetchBrands)
watch(page, fetchBrands)

function editBrand(brand) {
  editingBrand.value = brand
  brandForm.value = { ...brand }
}

async function saveBrand() {
  if (editingBrand.value) {
    await axios.put(`/api/brands/${editingBrand.value.id}`, brandForm.value)
  } else {
    await axios.post('/api/brands', brandForm.value)
  }
  closeDialog()
  page.value = 1
  fetchBrands()
}

async function deleteBrand(id) {
  if (!confirm('确定要删除该品牌吗？该品牌下所有商品将被下架！')) return;
  try {
    const res = await axios.delete(`/api/brands/${id}`)
    if (res.data.code === 0) {
      if (brands.value.length === 1 && page.value > 1) {
        page.value--
      }
      await fetchBrands()
      alert('品牌已删除，相关商品已下架')
    } else {
      alert('删除失败: ' + res.data.message)
    }
  } catch (error) {
    alert('删除失败: ' + error.message)
  }
}

function closeDialog() {
  showAddDialog.value = false
  editingBrand.value = null
  brandForm.value = { name: '', logo: '' }
}

function handlePageChange(p) {
  if (p !== page.value && p > 0 && p <= totalPages.value) {
    page.value = p
  }
}
</script>

<style scoped>
.content-page {
  display: block;
  padding: 20px;
}
.content-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  margin-bottom: 25px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title {
  font-size: 1.5rem;
  color: #4361ee;
  font-weight: 600;
}
.section-actions {
  display: flex;
  gap: 10px;
}
.search-input {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-right: 10px;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.admin-table th {
  background-color: #f8f9fa;
  text-align: left;
  padding: 15px;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 1px solid #e9ecef;
}
.admin-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}
.admin-table tr:last-child td {
  border-bottom: none;
}
.admin-table tr:hover {
  background-color: rgba(67, 97, 238, 0.03);
}
.btn {
  padding: 8px 15px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.btn-sm {
  padding: 5px 10px;
  font-size: 0.85rem;
}
.btn-primary {
  background: #4361ee;
  color: white;
}
.btn-danger {
  background: #f72585;
  color: white;
}
.btn-outline {
  background: transparent;
  border: 1px solid #4361ee;
  color: #4361ee;
}
.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
.dialog-mask { position: fixed; left:0;top:0;right:0;bottom:0; background:rgba(0,0,0,0.1); display:flex;align-items:center;justify-content:center; }
.dialog { background:#fff; padding:24px; border-radius:8px; min-width:300px; }
.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
.page-item {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--light);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  border: none;
  margin: 0 2px;
}
.page-item:hover, .page-item.active {
  background: var(--primary);
  color: white;
}
</style>