import apiClient from '../api/axios'
import { API } from '../api/endpoints'

export async function getAssignedStudents() {
  const response = await apiClient.get(API.FACULTY.STUDENTS)
  return response.data
}

export async function getStudentDetail(studentId) {
  const response = await apiClient.get(API.FACULTY.STUDENT_DETAIL(studentId))
  return response.data
}
