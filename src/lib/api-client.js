import axios from 'axios'
import { HOST } from '@/utills/constants'

const apiClient = axios.create({
  baseURL: HOST,
  withCredentials: true
})

export default apiClient

