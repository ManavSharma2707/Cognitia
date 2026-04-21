import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function login(email, password) {
  const response = await apiClient.post(API.AUTH.LOGIN, { email, password })
  return response.data
}

export async function register(payload) {
  const response = await apiClient.post(API.AUTH.REGISTER, payload)
  return response.data
}

export async function getMe() {
  const response = await apiClient.get(API.AUTH.ME)
  return response.data
}
