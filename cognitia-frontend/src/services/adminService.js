import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function listUsers(page, limit, role) {
  const params = { page, limit }
  if (role) params.role = role

  const response = await apiClient.get(API.ADMIN.USERS, { params })
  return response.data
}

export async function deactivateUser(userId) {
  const response = await apiClient.patch(API.ADMIN.DEACTIVATE_USER(userId))
  return response.data
}

export async function assignFacultyStudent(facultyUserId, studentUserId) {
  const response = await apiClient.post(API.ADMIN.ASSIGN_FACULTY_STUDENT, {
    faculty_user_id: facultyUserId,
    student_user_id: studentUserId,
  })
  return response.data
}

export async function createMapping(payload) {
  const response = await apiClient.post(API.ADMIN.MAPPINGS, payload)
  return response.data
}

export async function addTrackModule(trackId, payload) {
  const response = await apiClient.post(API.ADMIN.TRACK_MODULES(trackId), payload)
  return response.data
}
