import axios from 'axios'

const api = axios.create({
  baseURL:  (process.env.NEXT_PUBLIC_API_URL || '') +
    (process.env.NEXT_PUBLIC_API_PREFIX || ''),
  timeout: 5000,
  withCredentials: true,
  // TODO: add authentication headers, when needed
  headers: {},
}) 

export default api
