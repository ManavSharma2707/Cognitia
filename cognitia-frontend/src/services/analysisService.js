import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function getSkillGap() {
  const response = await apiClient.get(API.ANALYSIS.SKILL_GAP)
  return response.data
}

export async function recalculate() {
  const response = await apiClient.post(API.ANALYSIS.RECALCULATE)
  return response.data
}
