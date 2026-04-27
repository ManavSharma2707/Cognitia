export const API = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN:    '/api/v1/auth/login',
    ME:       '/api/v1/auth/me',
  },
  STUDENTS: {
    PROFILE:        '/api/v1/students/profile',
    UPDATE_PROFILE: '/api/v1/students/profile',
  },
  ACADEMIC: {
    RECORDS: '/api/v1/academic/records',
  },
  ATTENDANCE: {
    RECORDS: '/api/v1/attendance/records',
  },
  ANALYSIS: {
    SKILL_GAP:   '/api/v1/analysis/skill-gap',
    RECALCULATE: '/api/v1/analysis/skill-gap/recalculate',
  },
  RECOMMENDATIONS: {
    LEARNING_PATH:        '/api/v1/recommendations/learning-path',
    GENERATE:             '/api/v1/recommendations/learning-path/generate',
    HISTORY:              '/api/v1/recommendations/learning-path/history',
    CAREER_TRACKS:        '/api/v1/recommendations/career-tracks',
    CAREER_TRACK_MODULES: (id) => `/api/v1/recommendations/career-tracks/${id}/modules`,
  },
  PROGRESS: {
    UPDATE_MODULE: (id) => `/api/v1/progress/modules/${id}`,
    SUMMARY:       '/api/v1/progress/summary',
  },
  FACULTY: {
    STUDENTS:       '/api/v1/faculty/students',
    STUDENT_DETAIL: (id) => `/api/v1/faculty/students/${id}`,
  },
  ADMIN: {
    USERS:           '/api/v1/users/',
    DEACTIVATE_USER: (id) => `/api/v1/users/${id}/deactivate`,
    ASSIGN_FACULTY_STUDENT: '/api/v1/users/assignments/faculty-student',
    MAPPINGS:        '/api/v1/admin/mappings/',
    TRACK_MODULES:   (id) => `/api/v1/admin/tracks/${id}/modules`,
  },
  HEALTH: '/health',
}
