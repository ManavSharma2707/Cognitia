import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function getProfile() {
  const response = await apiClient.get(API.STUDENTS.PROFILE)
  return response.data
}

export async function updateProfile(payload) {
  const response = await apiClient.put(API.STUDENTS.UPDATE_PROFILE, payload)
  return response.data
}
