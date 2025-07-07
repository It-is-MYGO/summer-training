import axios from 'axios'

export function aiChat(message) {
  return axios.post('/api/ai/chat', { message }).then(res => res.data)
}
