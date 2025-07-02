// 时间格式化工具

/**
 * 格式化时间为本地时区格式 (YYYY-MM-DD HH:mm)
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time) {
  if (!time) return ''
  
  let date
  if (time instanceof Date) {
    date = time
  } else {
    date = new Date(time)
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return time // 如果解析失败，返回原始字符串
  }
  
  // 直接使用本地时区格式化
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化时间为相对时间（如：刚刚、5分钟前、2小时前等）
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(time) {
  if (!time) return ''
  
  let date
  if (time instanceof Date) {
    date = time
  } else {
    date = new Date(time)
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return time
  }
  
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  // 超过30天显示具体日期
  return formatTime(time)
}

/**
 * 格式化评论时间（显示相对时间，超过7天显示具体日期）
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatCommentTime(time) {
  if (!time) return ''
  
  let date
  if (time instanceof Date) {
    date = time
  } else {
    date = new Date(time)
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return time
  }
  
  const now = new Date()
  const diff = now - date
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  
  if (diff < sevenDays) {
    return formatRelativeTime(time)
  } else {
    return formatTime(time)
  }
} 