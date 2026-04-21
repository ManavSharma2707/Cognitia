import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function addRecord(payload) {
  const response = await apiClient.post(API.ACADEMIC.RECORDS, payload)
  return response.data
}

export async function getRecords(semester) {
  const params = semester ? { semester } : undefined
  const response = await apiClient.get(API.ACADEMIC.RECORDS, { params })
  return response.data
}
