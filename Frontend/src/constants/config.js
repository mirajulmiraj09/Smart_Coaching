/**
 * Application constants and configuration
 * Vite uses import.meta.env.VITE_* instead of process.env.REACT_APP_*
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
}

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Smart Coaching Center',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
}

export const ROLE_NAMES = {
  COACHING_ADMIN: 'coaching_admin',
  COACHING_MANAGER: 'coaching_manager',
  COACHING_STAFF: 'coaching_staff',
  TEACHER: 'teacher',
  STUDENT: 'student',
  LLM: 'llm',
}

export const ROLE_LABELS = {
  coaching_admin: 'Coaching Admin',
  coaching_manager: 'Coaching Manager',
  coaching_staff: 'Coaching Staff',
  teacher: 'Teacher',
  student: 'Student',
  llm: 'LLM System',
}

export const GENDER_CHOICES = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
}

export const GENDER_LABELS = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

export const EMPLOYMENT_STATUS = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
}

export const EMPLOYMENT_STATUS_LABELS = {
  full_time: 'Full Time',
  part_time: 'Part Time',
}

export const RESULT_STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
}

export const RESULT_STATUS_LABELS = {
  passed: 'Passed',
  failed: 'Failed',
}

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CENTERS: '/dashboard/centers',
  ACADEMICS: '/dashboard/academics',
  EXAMS: '/dashboard/exams',
  RESULTS: '/dashboard/results',
  TEACHING: '/dashboard/teaching',
  AI_ENGINE: '/dashboard/ai',
  NOTIFICATIONS: '/dashboard/notifications',
  PROFILE: '/dashboard/profile',
}

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}

// Feature Flags
export const FEATURES = {
  AI_ENGINE: import.meta.env.VITE_ENABLE_AI_ENGINE === 'true',
  NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
}
