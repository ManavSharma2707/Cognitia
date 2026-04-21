import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function addRecord(payload) {
  const response = await apiClient.post(API.ATTENDANCE.RECORDS, payload)
  return response.data
}
