import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function getLearningPath() {
  const response = await apiClient.get(API.RECOMMENDATIONS.LEARNING_PATH)
  return response.data
}

export async function generatePath() {
  const response = await apiClient.post(API.RECOMMENDATIONS.GENERATE)
  return response.data
}

export async function getHistory() {
  const response = await apiClient.get(API.RECOMMENDATIONS.HISTORY)
  return response.data
}

export async function getCareerTracks() {
  const response = await apiClient.get(API.RECOMMENDATIONS.CAREER_TRACKS)
  return response.data
}

export async function getTrackModules(trackId) {
  const response = await apiClient.get(API.RECOMMENDATIONS.CAREER_TRACK_MODULES(trackId))
  return response.data
}
