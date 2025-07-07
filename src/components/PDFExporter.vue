<template>
  <div class="pdf-exporter">
    <div class="export-options" v-if="showOptions">
      <h3>PDF导出选项</h3>
      
      <div class="option-group">
        <label>报告标题：</label>
        <input v-model="exportOptions.title" type="text" placeholder="平台数据分析报告" />
      </div>
      
      <div class="option-group">
        <label>包含内容：</label>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="exportOptions.includeCharts" />
            图表
          </label>
          <label>
            <input type="checkbox" v-model="exportOptions.includeInsights" />
            AI洞察
          </label>
          <label>
            <input type="checkbox" v-model="exportOptions.includePrediction" />
            市场预测
          </label>
          <label>
            <input type="checkbox" v-model="exportOptions.includeSummary" />
            数据摘要
          </label>
        </div>
      </div>
      
      <div class="option-group">
        <label>页面设置：</label>
        <select v-model="exportOptions.pageSize">
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="a3">A3</option>
        </select>
      </div>
      
      <div class="option-group">
        <label>图片质量：</label>
        <select v-model="exportOptions.imageQuality">
          <option value="1">标准</option>
          <option value="2">高清</option>
          <option value="3">超高清</option>
        </select>
      </div>
      
      <div class="export-actions">
        <button class="btn btn-primary" @click="startExport">开始导出</button>
        <button class="btn btn-secondary" @click="cancelExport">取消</button>
      </div>
    </div>
    
    <div class="export-progress" v-if="isExporting">
      <div class="progress-content">
        <div class="progress-spinner"></div>
        <div class="progress-text">{{ progressText }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default {
  name: 'PDFExporter',
  props: {
    exportTargetSelector: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showOptions: false,
      isExporting: false,
      progress: 0,
      progressText: '准备导出...',
      exportOptions: {
        title: '平台数据分析报告',
        includeCharts: true,
        includeInsights: true,
        includePrediction: true,
        includeSummary: true,
        pageSize: 'a4',
        imageQuality: 2
      }
    }
  },
  methods: {
    showExportDialog() {
      this.showOptions = true
    },
    
    cancelExport() {
      this.showOptions = false
    },
    
    async startExport() {
      this.showOptions = false
      this.isExporting = true
      this.progress = 0
      
      try {
        await this.generatePDF()
        this.$emit('export-complete', true)
      } catch (error) {
        console.error('PDF导出失败:', error)
        this.$emit('export-error', error)
      } finally {
        this.isExporting = false
      }
    },
    
    async generatePDF() {
      this.updateProgress(10, '生成中...')
      const target = document.querySelector(this.exportTargetSelector)
      if (!target) throw new Error('未找到要导出的内容区域')
      const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#fff' })
      this.updateProgress(60, '生成PDF...')
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      // 计算图片宽高，等比缩放
      const imgProps = pdf.getImageProperties(imgData)
      let pdfWidth = pageWidth
      let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      let position = 0
      // 多页处理
      if (pdfHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      } else {
        while (pdfHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, (imgProps.height * pdfWidth) / imgProps.width)
          pdfHeight -= pageHeight
          position -= pageHeight
          if (pdfHeight > 0) pdf.addPage()
        }
      }
      this.updateProgress(100, '保存文件...')
      pdf.save('平台数据分析报告.pdf')
    },
    
    updateProgress(progress, text) {
      this.progress = progress
      this.progressText = text
    }
  }
}
</script>

<style scoped>
.pdf-exporter {
  position: relative;
}

.export-options {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 10000;
  min-width: 400px;
  max-width: 500px;
}

.export-options h3 {
  margin: 0 0 20px 0;
  color: var(--primary);
  text-align: center;
}

.option-group {
  margin-bottom: 20px;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark);
}

.option-group input[type="text"],
.option-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  margin-bottom: 0;
}

.export-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.export-progress {
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

.progress-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  min-width: 300px;
}

.progress-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-text {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--dark);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f3f3f3;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}
</style> 