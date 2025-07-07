<template>
  <div class="content-page">
    <div class="section-header">
      <h2 class="section-title">平台数据分析</h2>
      <div class="section-actions">
        <button class="btn btn-outline" @click="testAPI">测试API连接</button>
        <button class="btn btn-outline" @click="checkAIConfig">检查AI配置</button>
        <button class="btn btn-outline" @click="generateMarketPrediction">市场预测</button>
        <button class="btn btn-outline" @click="showPDFExport">导出PDF报告</button>
      </div>
    </div>
    
    <div id="export-content">
      <div class="charts-container">
        <div class="chart-box">
          <div class="chart-title">用户活跃度分布</div>
          <div class="chart-content" ref="userActivityChart"></div>
        </div>
        
        <div class="chart-box">
          <div class="chart-title">商品类别分布</div>
          <div class="chart-content" ref="productCategoryChart"></div>
        </div>
        
        <div class="chart-box">
          <div class="chart-title">价格趋势监控</div>
          <div class="chart-content" ref="priceTrendChart"></div>
          <div class="chart-controls">
            <select v-model="selectedCategory" @change="updatePriceTrendChart" class="category-select">
              <option value="">所有类别</option>
              <option value="手机数码">手机数码</option>
              <option value="服装鞋帽">服装鞋帽</option>
              <option value="运动户外">运动户外</option>
              <option value="家居生活">家居生活</option>
              <option value="食品饮料">食品饮料</option>
              <option value="母婴用品">母婴用品</option>
              <option value="美妆护肤">美妆护肤</option>
              <option value="图书音像">图书音像</option>
              <option value="汽车用品">汽车用品</option>
              <option value="医药保健">医药保健</option>
              <option value="未分类">未分类</option>
            </select>
            <select v-model="timeRange" @change="updatePriceTrendChart" class="time-select">
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
            </select>
          </div>
          <div class="ai-insights" v-if="aiInsights.length > 0">
            <h4>AI 监控洞察</h4>
            <div class="insight-item" v-for="insight in aiInsights" :key="insight.id" :class="insight.type">
              <span class="insight-icon">{{ insight.icon }}</span>
              <span class="insight-text" v-html="insight.message"></span>
            </div>
          </div>
        </div>
        
        <div class="chart-box">
          <div class="chart-title">平台商品数量对比</div>
          <div class="chart-content" ref="platformComparisonChart"></div>
        </div>
        
        <!-- 市场预测显示区域 -->
        <div class="chart-box" v-if="marketPrediction">
          <div class="chart-title">AI市场趋势预测</div>
          <div class="prediction-content">
            <div class="prediction-text" v-html="formattedPrediction"></div>
            <div class="prediction-actions">
              <button class="btn btn-outline" @click="refreshPrediction">刷新预测</button>
              <button class="btn btn-outline" @click="clearPrediction">清除预测</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PDFExporter
      ref="pdfExporter"
      :exportTargetSelector="'#export-content'"
      @export-complete="onExportComplete"
      @export-error="onExportError"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PDFExporter from '../../components/PDFExporter.vue'

// 配置jsPDF支持中文
// 使用内置的中文字体支持

export default {
  name: 'Charts',
  components: {
    PDFExporter
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
    // 定时更新价格趋势数据
    this.priceUpdateTimer = setInterval(() => {
      this.updatePriceTrendChart()
    }, 300000) // 每5分钟更新一次
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.charts.forEach(chart => chart.dispose())
    if (this.priceUpdateTimer) {
      clearInterval(this.priceUpdateTimer)
    }
  },
  data() {
    return {
      charts: [],
      selectedCategory: '',
      timeRange: '7',
      priceData: [],
      aiInsights: [],
      marketPrediction: '',
      aiConfigStatus: null
    }
  },
  computed: {
    formattedPrediction() {
      if (!this.marketPrediction) return '';
      
      // 将换行符转换为HTML换行
      return this.marketPrediction
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    },
    
    // 为PDF导出准备图表数据
    chartDataForExport() {
      const charts = [];
      
      // 用户活跃度图表
      if (this.$refs.userActivityChart) {
        charts.push({
          element: this.$refs.userActivityChart,
          title: '用户活跃度分布'
        });
      }
      
      // 商品类别图表
      if (this.$refs.productCategoryChart) {
        charts.push({
          element: this.$refs.productCategoryChart,
          title: '商品类别分布'
        });
      }
      
      // 价格趋势图表
      if (this.$refs.priceTrendChart) {
        charts.push({
          element: this.$refs.priceTrendChart,
          title: '价格趋势监控'
        });
      }
      
      // 平台对比图表
      if (this.$refs.platformComparisonChart) {
        charts.push({
          element: this.$refs.platformComparisonChart,
          title: '平台商品数量对比'
        });
      }
      
      return charts;
    },
    
    // 报告摘要
    reportSummary() {
      return this.generateReportSummary();
    }
  },
  methods: {
    // 测试API连接
    async testAPI() {
      try {
        console.log('🧪 测试API连接...');
        
        // 测试不需要认证的路由
        const testResponse = await axios.get('/api/admin/test');
        console.log('✅ 测试路由响应:', testResponse.data);
        
        // 测试数据库连接
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔑 找到token，测试认证路由...');
          const priceResponse = await axios.get('/api/admin/price-trends?days=1', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ 价格趋势API响应:', priceResponse.data);
        } else {
          console.warn('⚠️ 未找到token，跳过认证测试');
        }
      } catch (error) {
        console.error('❌ API测试失败:', error.response?.data || error.message);
      }
    },

    // 检查智谱AI配置
    async checkAIConfig() {
      try {
        console.log('🔧 检查智谱AI配置...');
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('⚠️ 未找到token，无法检查AI配置');
          return;
        }
        
        const response = await axios.get('/api/admin/ai-config-check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          this.aiConfigStatus = response.data.config;
          console.log('✅ AI配置检查完成:', this.aiConfigStatus);
          
          if (this.aiConfigStatus.apiKeyConfigured) {
            alert('✅ 智谱AI配置正常，API密钥已配置');
          } else {
            alert('⚠️ 智谱AI配置异常，请检查API密钥配置');
          }
        }
      } catch (error) {
        console.error('❌ AI配置检查失败:', error.response?.data || error.message);
        alert('❌ AI配置检查失败: ' + (error.response?.data?.message || error.message));
      }
    },

    // 生成市场预测
    async generateMarketPrediction() {
      try {
        console.log('🔮 开始生成市场预测...');
        
        if (this.priceData.length === 0) {
          alert('⚠️ 请先加载价格数据');
          return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('⚠️ 未找到token，无法生成预测');
          return;
        }
        
        const response = await axios.post('/api/admin/ai-market-prediction', {
          priceData: this.priceData,
          category: this.selectedCategory
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          this.marketPrediction = response.data.prediction;
          console.log('✅ 市场预测生成完成');
        }
      } catch (error) {
        console.error('❌ 市场预测生成失败:', error.response?.data || error.message);
        alert('❌ 市场预测生成失败: ' + (error.response?.data?.message || error.message));
      }
    },

    // 刷新市场预测
    async refreshPrediction() {
      await this.generateMarketPrediction();
    },

    // 清除市场预测
    clearPrediction() {
      this.marketPrediction = '';
    },

    // 显示PDF导出对话框
    showPDFExport() {
      this.$refs.pdfExporter.showExportDialog()
    },
    
    // PDF导出完成回调
    onExportComplete() {
      console.log('✅ PDF导出完成');
      alert('PDF报告导出成功！');
    },
    
    // PDF导出错误回调
    onExportError(error) {
      console.error('❌ PDF导出失败:', error);
      alert('PDF导出失败: ' + error.message);
    },
    
    // 生成报告摘要
    generateReportSummary() {
      const summary = [];
      
      // 添加基本信息
      summary.push(`本报告包含平台数据分析的完整内容，涵盖用户活跃度、商品分布、价格趋势等多个维度。`);
      
      // 添加数据统计
      if (this.priceData && this.priceData.length > 0) {
        summary.push(`分析时间范围：最近${this.timeRange}天`);
        summary.push(`数据点数量：${this.priceData.length}天`);
      }
      
      // 添加AI分析状态
      if (this.aiInsights && this.aiInsights.length > 0) {
        summary.push(`AI智能洞察：${this.aiInsights.length}条`);
      }
      
      if (this.marketPrediction) {
        summary.push(`市场预测：已生成`);
      }
      
      summary.push(`报告生成时间：${new Date().toLocaleString('zh-CN')}`);
      
      return summary.join(' ');
    },

    // 获取价格趋势数据
    async fetchPriceTrendData() {
      try {
        // 获取认证token
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('未找到认证token，跳过价格趋势数据获取')
          return []
        }
        
        const params = {
          days: this.timeRange,
          category: this.selectedCategory || undefined
        }
        const response = await axios.get('/api/admin/price-trends', { 
          params,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.data && response.data.success) {
          this.priceData = response.data.data
          return response.data.data
        }
      } catch (error) {
        console.error('获取价格趋势数据失败:', error)
      }
      return []
    },

    // AI 价格监控分析
    async analyzePriceData(priceData) {
      try {
        // 获取认证token
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('未找到认证token，跳过AI分析')
          this.performLocalAnalysis(priceData)
          return
        }
        
        const response = await axios.post('/api/admin/ai-price-analysis', {
          priceData: priceData,
          category: this.selectedCategory,
          timeRange: this.timeRange
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.data && response.data.success) {
          this.aiInsights = response.data.insights || []
        }
      } catch (error) {
        console.error('AI分析失败:', error)
        // 本地简单分析作为备选
        this.performLocalAnalysis(priceData)
      }
    },

    // 本地简单价格分析（备选方案）
    performLocalAnalysis(priceData) {
      const insights = []
      
      if (priceData.length === 0) return
      
      // 计算价格变化率
      const latestPrices = priceData[priceData.length - 1]?.prices || []
      const previousPrices = priceData[priceData.length - 2]?.prices || []
      
      if (latestPrices.length > 0 && previousPrices.length > 0) {
        const avgLatest = latestPrices.reduce((sum, p) => sum + p.price, 0) / latestPrices.length
        const avgPrevious = previousPrices.reduce((sum, p) => sum + p.price, 0) / previousPrices.length
        
        const changeRate = ((avgLatest - avgPrevious) / avgPrevious) * 100
        
        if (changeRate > 10) {
          insights.push({
            id: Date.now(),
            type: 'warning',
            icon: '⚠️',
            message: `价格异常上涨 ${changeRate.toFixed(1)}%，建议关注`
          })
        } else if (changeRate < -10) {
          insights.push({
            id: Date.now(),
            type: 'info',
            icon: '📉',
            message: `价格下降 ${Math.abs(changeRate).toFixed(1)}%，可能是促销时机`
          })
        }
      }
      
      // 检测价格波动
      const allPrices = priceData.flatMap(day => day.prices || [])
      if (allPrices.length > 0) {
        const prices = allPrices.map(p => p.price)
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
        const stdDev = Math.sqrt(variance)
        const coefficient = (stdDev / mean) * 100
        
        if (coefficient > 20) {
          insights.push({
            id: Date.now() + 1,
            type: 'warning',
            icon: '📊',
            message: `价格波动较大 (${coefficient.toFixed(1)}%)，市场不稳定`
          })
        }
      }
      
      this.aiInsights = insights
    },

    // 更新价格趋势图表
    async updatePriceTrendChart() {
      const priceData = await this.fetchPriceTrendData()
      await this.analyzePriceData(priceData)
      
      if (priceData.length === 0) return
      
      // 处理数据格式
      const dates = priceData.map(day => day.date)
      const categories = [...new Set(priceData.flatMap(day => day.prices?.map(p => p.category) || []))]
      
      const series = categories.map(category => {
        const data = priceData.map(day => {
          const categoryPrices = day.prices?.filter(p => p.category === category) || []
          return categoryPrices.length > 0 
            ? categoryPrices.reduce((sum, p) => sum + p.price, 0) / categoryPrices.length
            : 0
        })
        
        return {
          name: category,
          type: 'line',
          smooth: true,
          data: data,
          lineStyle: { width: 3 },
          markPoint: {
            data: [
              { type: 'max', name: '最高价' },
              { type: 'min', name: '最低价' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均价' }
            ]
          }
        }
      })
      
      // 确保图表已初始化
      if (this.charts.length < 3) {
        console.warn('价格趋势图表未初始化，跳过更新')
        return
      }
      
      const priceTrendChart = this.charts[2]
      priceTrendChart.setOption({
        tooltip: { 
          trigger: 'axis',
          formatter: function(params) {
            let result = params[0].axisValue + '<br/>'
            params.forEach(param => {
              result += param.marker + param.seriesName + ': ¥' + param.value.toFixed(2) + '<br/>'
            })
            return result
          }
        },
        legend: {
          data: categories
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: { 
          type: 'value', 
          name: '价格 (元)',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: series,
        color: [
          '#4361ee', '#f72585', '#4cc9f0', '#7209b7', '#3a0ca3',
          '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'
        ]
      })
    },

    async initCharts() {
      // 用户活跃度分布图
      const userActivityChart = echarts.init(this.$refs.userActivityChart)
      // 动态获取数据
      let activityData = [
        { value: 0, name: '高活跃用户' },
        { value: 0, name: '中等活跃用户' },
        { value: 0, name: '低活跃用户' },
        { value: 0, name: '新用户' }
      ]
      try {
        const token = localStorage.getItem('token')
        if (token) {
          console.log('📊 获取用户活跃度数据...');
          const res = await axios.get('/api/users/activity-distribution', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (res.data && res.data.success && res.data.data) {
            activityData = res.data.data
            console.log('✅ 用户活跃度数据获取成功:', activityData);
          } else {
            console.warn('⚠️ 用户活跃度数据格式异常:', res.data);
          }
        }
      } catch (e) { 
        console.error('❌ 获取用户活跃度数据失败:', e);
      }
      userActivityChart.setOption({
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [{
          name: '用户活跃度',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: { show: false },
          data: activityData,
          color: ['#4361ee', '#4cc9f0', '#f72585', '#6c757d']
        }]
      })

      // 商品类别分布图
      const productCategoryChart = echarts.init(this.$refs.productCategoryChart)
      // 动态获取分类分布数据
      let categoryData = {
        categories: ['手机数码', '服装鞋帽', '运动户外', '家居生活', '食品饮料', '母婴用品', '美妆护肤', '图书音像', '汽车用品', '医药保健', '未分类'],
        counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
      
      try {
        const res = await axios.get('/api/products/category-distribution')
        if (res.data && res.data.code === 0 && res.data.data) {
          const data = res.data.data
          categoryData.categories = data.map(item => item.category)
          categoryData.counts = data.map(item => item.count)
        }
      } catch (e) {
        console.error('获取分类分布数据失败:', e)
      }
      
      productCategoryChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>商品数量: ${data.value} 件`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categoryData.categories,
          axisTick: { alignWithLabel: true },
          axisLabel: {
            rotate: 45,
            fontSize: 12
          }
        },
        yAxis: { 
          type: 'value', 
          name: '商品数量',
          nameTextStyle: {
            fontSize: 12
          }
        },
        series: [{
          name: '商品数量',
          type: 'bar',
          barWidth: '60%',
          data: categoryData.counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4361ee' },
              { offset: 1, color: '#4cc9f0' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 11
          }
        }]
      })

      // 价格趋势监控图
      const priceTrendChart = echarts.init(this.$refs.priceTrendChart)
      // 先设置一个基础的图表配置，避免未定义错误
      priceTrendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: [] },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: { 
          type: 'value', 
          name: '价格 (元)',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [],
        color: [
          '#4361ee', '#f72585', '#4cc9f0', '#7209b7', '#3a0ca3',
          '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'
        ]
      })

      // 平台商品数量对比图
      const platformComparisonChart = echarts.init(this.$refs.platformComparisonChart)
      let platformData = { categories: [], jd: [], tmall: [], pdd: [], suning: [] }
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/admin/platform-comparison', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data && res.data.success && res.data.data) {
          const data = res.data.data
          platformData.categories = data.map(item => item.category)
          platformData.jd = data.map(item => item['京东'] || 0)
          platformData.tmall = data.map(item => item['天猫'] || 0)
          platformData.pdd = data.map(item => item['拼多多'] || 0)
          platformData.suning = data.map(item => item['苏宁'] || 0)
        }
      } catch (e) {
        console.error('获取平台商品数量对比数据失败:', e)
      }
      platformComparisonChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function(params) {
            let html = params[0].name + '<br/>';
            params.forEach(item => {
              html += `${item.marker}${item.seriesName}: ${item.value} 件<br/>`
            })
            return html
          }
        },
        legend: {
          data: ['京东', '天猫', '拼多多', '苏宁']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: platformData.categories,
          axisTick: { alignWithLabel: true },
          axisLabel: {
            rotate: 45,
            fontSize: 12
          }
        }],
        yAxis: [{ type: 'value', name: '商品数量', nameTextStyle: { fontSize: 12 } }],
        series: [
          {
            name: '京东',
            type: 'bar',
            stack: false,
            data: platformData.jd,
            itemStyle: { color: '#e74c3c' },
            label: { show: true, position: 'top', fontSize: 11 }
          },
          {
            name: '天猫',
            type: 'bar',
            stack: false,
            data: platformData.tmall,
            itemStyle: { color: '#f39c12' },
            label: { show: true, position: 'top', fontSize: 11 }
          },
          {
            name: '拼多多',
            type: 'bar',
            stack: false,
            data: platformData.pdd,
            itemStyle: { color: '#2ecc71' },
            label: { show: true, position: 'top', fontSize: 11 }
          },
          {
            name: '苏宁',
            type: 'bar',
            stack: false,
            data: platformData.suning,
            itemStyle: { color: '#9b59b6' },
            label: { show: true, position: 'top', fontSize: 11 }
          }
        ]
      })

      this.charts = [userActivityChart, productCategoryChart, priceTrendChart, platformComparisonChart]
      
      // 在图表初始化完成后再加载价格数据
      setTimeout(() => {
        this.updatePriceTrendChart()
      }, 100)
    },
    handleResize() {
      this.charts.forEach(chart => chart.resize())
    }
  }
}
</script>

<style scoped>
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.chart-box {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  min-height: 350px;
}

.chart-title {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: var(--primary);
  text-align: center;
}

.chart-content {
  height: 300px;
}

.chart-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.category-select,
.time-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
}

.ai-insights {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.ai-insights h4 {
  margin: 0 0 10px 0;
  color: var(--primary);
  font-size: 16px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.insight-item.warning {
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.insight-item.info {
  background: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.insight-item.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.insight-icon {
  font-size: 16px;
}

.prediction-content {
  padding: 15px;
}

.prediction-text {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

.prediction-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* PDF导出相关样式 */
.btn-outline {
  border: 1px solid var(--primary);
  color: var(--primary);
  background: transparent;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-outline:active {
  transform: translateY(1px);
}

/* 加载提示样式 */
#pdf-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-controls {
    flex-direction: column;
  }
  
  .prediction-actions {
    flex-direction: column;
  }
}
</style>