export async function getUserLogs(userId, page = 1, pageSize = 20) {
  return fetch(`/api/log/user-logs?userId=${userId}&page=${page}&pageSize=${pageSize}`)
    .then(res => res.json())
}

// 获取所有用户日志
export async function getAllLogs(page = 1, pageSize = 20) {
  return fetch(`/api/log/user-logs?page=${page}&pageSize=${pageSize}`)
    .then(res => res.json())
}
