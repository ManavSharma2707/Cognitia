import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function getSummary() {
  const response = await apiClient.get(API.PROGRESS.SUMMARY)
  return response.data
}

export async function updateModuleStatus(moduleId, status) {
  const response = await apiClient.patch(API.PROGRESS.UPDATE_MODULE(moduleId), { status })
  return response.data
}
