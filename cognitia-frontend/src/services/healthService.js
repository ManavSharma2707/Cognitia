import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function getHealth() {
  const response = await apiClient.get(API.HEALTH)
  return response.data
}
