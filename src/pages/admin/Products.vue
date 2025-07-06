<template>
   <div class="content-page active">  
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">商品管理</h2>
        <div class="section-actions">
          <button class="btn btn-primary" @click="showAddDialog = true">添加商品</button>
        </div>
      </div>
      
      <!-- 分类筛选 -->
      <div class="filter-section">
        <div class="filter-group">
          <label>分类筛选:</label>
          <select v-model="selectedCategory" @change="filterByCategory" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>状态筛选:</label>
          <select v-model="selectedStatus" @change="filterByStatus" class="filter-select">
            <option value="">全部状态</option>
            <option value="1">已上架</option>
            <option value="0">已下架</option>
          </select>
        </div>
        <div class="filter-group">
          <button class="btn btn-outline" @click="clearFilters">清除筛选</button>
        </div>
      </div>
      
      <!-- 添加商品弹窗 -->
      <div v-if="showAddDialog" class="dialog-mask" @click.self="showAddDialog = false">
        <div class="dialog">
          <h3>添加商品</h3>
          <form @submit.prevent="submitAddProduct">
            <div class="form-row">
              <label>商品名称</label>
              <input v-model="addForm.title" required maxlength="100" />
            </div>
            <div class="form-row">
              <label>描述</label>
              <textarea v-model="addForm.desc" maxlength="500" />
            </div>
            <div class="form-row">
              <label>图片URL</label>
              <input v-model="addForm.img" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit">提交</button>
              <button class="btn btn-outline" type="button" @click="showAddDialog = false">取消</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 编辑商品弹窗 -->
      <div v-if="showEditDialog" class="dialog-mask" @click.self="showEditDialog = false">
        <div class="dialog">
          <h3>编辑商品</h3>
          <form @submit.prevent="submitEditProduct">
            <div class="form-row">
              <label>商品名称</label>
              <input v-model="editForm.title" required maxlength="100" />
            </div>
            <div class="form-row">
              <label>描述</label>
              <textarea v-model="editForm.desc" maxlength="500" />
            </div>
            <div class="form-row">
              <label>图片URL</label>
              <input v-model="editForm.img" />
            </div>
            <div class="form-row form-row-inline">
              <div class="form-group">
              <label>分类</label>
              <select v-model="editForm.category" class="form-select">
                <option value="">请选择分类</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
              <div class="form-group">
              <label>品牌</label>
              <select v-model="editForm.brand_id">
                <option v-for="brand in brands" :value="brand.id">{{ brand.name }}</option>
                <option value="__new__">+ 新建品牌</option>
              </select>
              <input v-if="editForm.brand_id === '__new__'" v-model="editForm.new_brand_name" placeholder="输入新品牌名" />
            </div>
            </div>
            <div class="form-row form-row-inline">
              <div class="form-group">
              <label>是否热门</label>
              <select v-model.number="editForm.is_hot">
                <option :value="1">是</option>
                <option :value="0">否</option>
              </select>
            </div>
              <div class="form-group">
              <label>是否降价</label>
              <select v-model.number="editForm.is_drop">
                <option :value="1">是</option>
                <option :value="0">否</option>
              </select>
            </div>
            </div>
            <div class="form-row form-row-inline">
              <div class="form-group">
              <label>平台</label>
              <select v-model="editForm.platform">
                <option value="jd">京东</option>
                <option value="tmall">天猫</option>
                <option value="pdd">拼多多</option>
                <option value="suning">苏宁</option>
              </select>
            </div>
              <div class="form-group">
              <label>价格</label>
              <input v-model.number="editForm.price" type="number" min="0" step="0.01" />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit">保存</button>
              <button class="btn btn-outline" type="button" @click="showEditDialog = false">取消</button>
            </div>
          </form>
        </div>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>平台及当前价格</th>
            <th>收藏次数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>
              <span class="category-badge">{{ product.category }}</span>
            </td>
            <td>
              <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                <span v-for="p in product.platformPrices" :key="p.platform" class="platform-badge" :style="{ background: platformColors[p.platform] || '#eee', color: '#fff' }">
                  {{ platformNames[p.platform] || p.platform }} {{ p.price ? `¥${p.price}` : '暂无' }}
                </span>
              </div>
            </td>
            <td>{{ product.favoriteCount }}</td>
            <td>
              <span :class="['status-badge', product.status == 1 ? 'status-active' : 'status-banned']">
                {{ product.status == 1 ? '已上架' : '已下架' }}
              </span>
            </td>
            <td class="user-actions">
              <button class="btn btn-sm btn-outline" @click="editProduct(product)">编辑</button>
              <button 
                v-if="product.status == 1"
                class="btn btn-sm btn-danger"
                @click="toggleProductStatus(product)">下架</button>
              <button 
                v-else
                class="btn btn-sm btn-primary"
                @click="toggleProductStatus(product)">上架</button>
              <button class="btn btn-sm btn-danger" @click="deleteProduct(product)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination">
        <div 
          class="page-item" 
          v-for="page in getPaginationPages" 
          :key="page" 
          :class="{active: currentPage === page, ellipsis: page === '...'}"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-left: 16px;">
          <input v-model.number="pageInput" type="number" min="1" :max="totalPages" placeholder="页码" style="width: 60px; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;" @keyup.enter="jumpToPage" />
          <button class="btn btn-outline btn-sm" @click="jumpToPage">跳转</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Products',
  data() {
    return {
      searchTerm: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      products: [],
      loading: false,
      platformIcons: {
        jd: 'fab fa-jd',
        tmall: 'fab fa-alipay',
        pdd: 'fas fa-shopping-basket',
        suning: 'fas fa-store'
      },
      platformNames: {
        jd: '京东',
        tmall: '天猫',
        pdd: '拼多多',
        suning: '苏宁'
      },
      platformColors: {
        jd: '#e74c3c', // 京东
        tmall: '#3498db', // 天猫
        suning: '#f39c12', // 苏宁
        pdd: '#9b59b6', // 拼多多
        taobao: '#1abc9c',
        dangdang: '#34495e'
      },
      showAddDialog: false,
      addForm: {
        title: '', desc: '', img: ''
      },
      showEditDialog: false,
      editForm: {
        id: '', title: '', desc: '', img: '', category: '', brand_id: '', is_hot: 0, is_drop: 0, platform: '', price: ''
      },
      brands: [],
      pageInput: '',
      selectedCategory: '',
      selectedStatus: '',
      categories: [], // 存储所有可用的分类
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize) || 1
    },
    getPaginationPages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
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
    }
  },
  async mounted() {
    await this.loadProducts()
    await this.loadCategories()
    const res = await fetch('/api/products/brands')
    this.brands = (await res.json()).data
  },
  methods: {
    async loadProducts(page = 1) {
      this.loading = true
      try {
        // 构建查询参数
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: this.pageSize.toString(),
          includeOffline: 'true'
        })
        
        // 添加筛选条件
        if (this.selectedCategory) {
          params.append('category', this.selectedCategory)
        }
        if (this.selectedStatus !== '') {
          params.append('status', this.selectedStatus)
        }
        
        const response = await fetch(`/api/products?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const result = await response.json()
        if (result.code === 0) {
          // 兼容不同的数据结构
          const productList = result.data.list || result.data.products || []
          // 并发请求每个商品的所有平台最新价格
          this.products = await Promise.all(productList.map(async product => {
            let platformPrices = []
            try {
              const res = await fetch(`/api/products/${product.id}/platform-prices`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              })
              platformPrices = await res.json()
              // 兼容后端返回格式
              if (platformPrices && platformPrices.length && platformPrices[0].platform) {
                platformPrices = platformPrices.map(p => ({
                  platform: this.mapPlatform(p.platform),
                  price: p.price
                }))
              } else {
                platformPrices = []
              }
            } catch (e) {
              platformPrices = []
            }
            return {
              id: product.id,
              name: product.title,
              category: product.category || '未分类',
              platformPrices,
              favoriteCount: product.favorite_count || 0,
              status: product.status || 1
            }
          }))
          this.total = result.data.total || 0
          this.currentPage = page
        } else {
          console.error('获取商品列表失败:', result.message)
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async loadCategories() {
      try {
        const response = await fetch('/api/products/category-distribution', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const result = await response.json()
        if (result.code === 0) {
          this.categories = result.data.map(item => item.category)
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    mapPlatform(platformStr) {
      if (!platformStr) return '-'
      if (platformStr.includes('京东')) return 'jd'
      if (platformStr.includes('天猫')) return 'tmall'
      if (platformStr.includes('拼多多')) return 'pdd'
      if (platformStr.includes('苏宁')) return 'suning'
      return platformStr // fallback
    },
    async toggleProductStatus(product) {
      const newStatus = product.status == 1 ? 0 : 1
      const action = newStatus == 1 ? '上架' : '下架'
      
      if (!confirm(`确定要${action}商品"${product.name}"吗？`)) {
        return
      }
      
      try {
        const response = await fetch(`/api/products/${product.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: newStatus })
        })
        const result = await response.json()
        if (result.code === 0) {
          alert(`商品${action}成功！`)
          this.loadProducts()
        } else {
          alert(`${action}失败: ` + result.message)
        }
      } catch (error) {
        alert(`${action}失败: ` + error)
      }
    },
    async deleteProduct(product) {
      if (!confirm('确定要删除该商品吗？此操作不可恢复！')) return
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const result = await response.json()
        if (result.code === 0) {
          this.loadProducts()
        } else {
          alert('删除失败: ' + result.message)
        }
      } catch (error) {
        alert('删除失败: ' + error)
      }
    },
    async editProduct(product) {
      try {
        // 获取商品的详细信息
        const response = await fetch(`/api/products/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const result = await response.json()
        if (result.code === 0) {
          const productDetail = result.data
          let platform = ''
          let price = ''
          if (productDetail.prices && Array.isArray(productDetail.prices) && productDetail.prices.length > 0) {
            platform = productDetail.prices[0].platform
            price = productDetail.prices[0].price
          } else if (productDetail.platform && productDetail.price) {
            platform = this.mapPlatform(productDetail.platform)
            price = productDetail.price
          }
          this.editForm = {
            id: productDetail.id,
            title: productDetail.title || productDetail.name || '',
            desc: productDetail.desc || '',
            img: productDetail.img || productDetail.image || '',
            category: productDetail.category || '',
            brand_id: productDetail.brand_id || '',
            is_hot: productDetail.is_hot || 0,
            is_drop: productDetail.is_drop || 0,
            platform,
            price
          }
          this.showEditDialog = true
        } else {
          console.error('API返回错误:', result)
          alert('获取商品详情失败: ' + (result.message || '未知错误'))
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
        alert('获取商品详情失败: ' + error.message)
      }
    },
    handlePageChange(page) {
      if (page === '...') return
      if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    async submitAddProduct() {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.addForm)
        })
        const result = await response.json()
        if (result.code === 0) {
          this.showAddDialog = false
          this.addForm = { title: '', desc: '', img: '' }
          this.loadProducts()
        } else {
          alert('添加失败: ' + result.message)
        }
      } catch (error) {
        alert('添加失败: ' + error)
      }
    },
    async submitEditProduct() {
      try {
        const { id, platform, price, ...data } = this.editForm
        if (data.brand_id === '') data.brand_id = null;
        const response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        })
        const result = await response.json()
        if (result.code === 0) {
          if (platform && price) {
            const platformMap = {
              jd: '京东',
              tmall: '天猫',
              pdd: '拼多多',
              suning: '苏宁'
            };
            const zhPlatform = platformMap[platform] || platform;
            await fetch('/api/products/product-prices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ product_id: id, platform: zhPlatform, price })
            })
          }
          this.showEditDialog = false
          this.loadProducts()
        } else {
          alert('编辑失败: ' + result.message)
        }
      } catch (error) {
        alert('编辑失败: ' + error)
      }
    },
    async handlePageChange(page) {
      if (page === '...' || page === this.currentPage) return
      await this.loadProducts(page)
    },
    
    async jumpToPage() {
      const page = Number(this.pageInput)
      if (page && page > 0 && page <= this.totalPages) {
        await this.loadProducts(page)
        this.pageInput = ''
      } else {
        alert('请输入有效的页码（1-' + this.totalPages + '）')
      }
    },
    
    // 筛选方法
    async filterByCategory() {
      this.currentPage = 1; // 重置到第一页
      await this.loadProducts(1);
    },
    
    async filterByStatus() {
      this.currentPage = 1; // 重置到第一页
      await this.loadProducts(1);
    },
    
    async clearFilters() {
      this.selectedCategory = '';
      this.selectedStatus = '';
      this.currentPage = 1;
      await this.loadProducts(1);
    },
  }
}
</script>

<style scoped>
:root {
 --primary: #4361ee;
 --secondary: #3f37c9;
 --success: #4cc9f0;
 --light: #f8f9fa;
 --dark: #212529;
 --warning: #f72585;
 --gray: #6c757d;
 --light-gray: #e9ecef;
}

.content-page {
 display: block; /* 修改为block确保显示 */
}

/* 修正所有缺少闭合括号的样式 */
.content-section {
 background: white;
 border-radius: 15px;
 padding: 25px;
 box-shadow: 0 5px 15px rgba(0,0,0,0.05);
 margin-bottom: 25px;
 width: 1200px;
 max-width: 100vw;
 margin-left: auto;
 margin-right: auto;
}

.section-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 20px;
 padding-bottom: 15px;
 border-bottom: 1px solid var(--light-gray);
}

/* 确保所有样式属性值都有正确的闭合括号 */
.btn-primary {
 background: var(--primary);
 color: white;
}

.content-page {
 display: none;
}

.content-page.active {
 display: block;
 animation: fadeIn 0.4s ease;
}

.section-title {
 font-size: 1.5rem;
 color: var(--primary);
 font-weight: 600;
}

.section-actions {
 display: flex;
 gap: 10px;
}

.filter-section {
 display: flex;
 gap: 20px;
 align-items: center;
 margin-bottom: 20px;
 padding: 15px;
 background: #f8fafd;
 border-radius: 12px;
 border: 1px solid #e9ecef;
}

.filter-group {
 display: flex;
 align-items: center;
 gap: 8px;
}

.filter-group label {
 font-size: 0.95rem;
 font-weight: 600;
 color: #4a5568;
 margin: 0;
}

.filter-select {
 padding: 8px 12px;
 border: 1px solid #e2e8f0;
 border-radius: 8px;
 font-size: 0.95rem;
 background: white;
 outline: none;
 transition: border-color 0.2s;
 min-width: 120px;
}

.filter-select:focus {
 border-color: #4f8cff;
 box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
}

.search-box {
 display: flex;
 align-items: center;
 background: var(--light);
 border-radius: 6px;
 padding: 5px 10px;
 margin-right: 10px;
}

.search-box input {
 border: none;
 background: transparent;
 padding: 8px;
 outline: none;
 width: 200px;
}

.search-box button {
 background: transparent;
 border: none;
 cursor: pointer;
 color: var(--gray);
 padding: 5px;
}

.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-top: 18px;
}
.admin-table th,
.admin-table td {
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  padding: 14px 8px;
  font-size: 1rem;
  background: #fff;
  transition: background 0.2s;
}
.admin-table th:last-child,
.admin-table td:last-child {
  border-right: none;
}
.admin-table tr:last-child td {
  border-bottom: none;
}
.admin-table tbody tr:hover {
  background: #f6faff;
}
.admin-table th {
  background: #f8fafd;
  font-weight: 700;
  font-size: 1.05rem;
}
.admin-table th:nth-child(2),
.admin-table td:nth-child(2) {
  max-width: 200px;
  word-break: break-all;
  white-space: normal;
}
.admin-table th:nth-child(3),
.admin-table td:nth-child(3) {
  width: 100px;
  text-align: center;
}
.admin-table th:nth-child(4),
.admin-table td:nth-child(4) {
  max-width: 260px;
  word-break: break-all;
  white-space: normal;
}
.admin-table th:nth-child(7),
.admin-table td:nth-child(7) {
  width: 140px;
  min-width: 110px;
  text-align: center;
}

.btn {
  border: none;
  border-radius: 22px;
  padding: 7px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(.4,2,.6,1);
  box-shadow: 0 2px 8px rgba(80,120,255,0.06);
}
.btn-primary {
  background: linear-gradient(90deg, #4f8cff 0%, #3ad1ff 100%);
  color: #fff;
}
.btn-danger {
  background: linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%);
  color: #fff;
}
.btn-outline {
  background: transparent;
  border: 1.5px solid #4f8cff;
  color: #4f8cff;
}
.btn:hover {
  opacity: 0.92;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(80,120,255,0.13);
}
.btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}
.btn-sm {
  padding: 5px 12px;
  font-size: 0.95rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #bdbdbd;
  letter-spacing: 1px;
}
.status-active {
  background: linear-gradient(90deg, #4f8cff 0%, #3ad1ff 100%);
}
.status-banned {
  background: linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%);
}
.platform-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.92rem;
  margin-right: 5px;
  font-weight: 600;
  border: none;
  box-shadow: 0 1px 4px rgba(80,120,255,0.07);
  letter-spacing: 0.5px;
}

.dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.22);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2.5px);
}
.dialog {
  background: #fff;
  border-radius: 18px;
  padding: 36px 32px 24px 32px;
  min-width: 340px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13);
  position: relative;
  animation: fadeIn 0.35s cubic-bezier(.4,2,.6,1);
}
.dialog h3 {
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 1.22rem;
  font-weight: 700;
  color: #4f8cff;
}
.form-row {
 margin-bottom: 14px;
 display: flex;
 flex-direction: column;
}
.form-row-inline {
  flex-direction: row;
  gap: 12px;
}
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.form-row label {
 font-size: 0.98rem;
 margin-bottom: 4px;
 color: #333;
}
.form-row input, .form-row textarea, .form-row select {
  padding: 7px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.form-select:focus {
  border-color: #4f8cff;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
}
.form-row textarea {
 min-height: 60px;
 resize: vertical;
}
.form-actions {
 display: flex;
 gap: 12px;
 margin-top: 10px;
 justify-content: flex-end;
}
.search-input {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 28px;
  gap: 12px;
}
.page-item {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8fafd;
  color: #4f8cff;
  font-weight: 600;
  font-size: 1.08rem;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.4,2,.6,1);
  box-shadow: 0 2px 8px rgba(80,120,255,0.06);
}
.page-item:hover, .page-item.active {
  background: linear-gradient(90deg, #4f8cff 0%, #3ad1ff 100%);
  color: #fff;
  transform: scale(1.08);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

@media (max-width: 768px) {
  .admin-table th, .admin-table td {
    font-size: 0.92rem;
    padding: 8px 2px;
  }
  .dialog {
    margin: 12px;
    max-width: calc(100vw - 24px);
    padding: 18px 8px 12px 8px;
  }
  .pagination {
    gap: 6px;
  }
}

.page-item.ellipsis {
  cursor: default;
  color: #bbb;
  background: none;
  box-shadow: none;
  pointer-events: none;
}
</style>