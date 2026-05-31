import axios from "axios";

const defaultApiBase =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : "http://localhost:5000/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultApiBase;
const TOKEN_KEY = "careerconnect-token";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const resolveUrl = (endpoint) => endpoint.replace(/^\//, "");
const isNotFound = (error) => error?.response?.status === 404;

async function requestWithFallback(method, endpoints, data, config = {}) {
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const response = await api.request({
        method,
        url: resolveUrl(endpoint),
        data,
        ...config,
      });
      return response.data;
    } catch (error) {
      lastError = error;
      if (!isNotFound(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export const authStorage = {
  setToken(token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  getToken() {
    return window.localStorage.getItem(TOKEN_KEY);
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export async function registerUser(payload) {
  return requestWithFallback("post", ["/users/register", "/auth/register"], payload);
}

export async function loginUser(payload) {
  return requestWithFallback("post", ["/users/login", "/auth/login"], payload);
}

export async function fetchCurrentUser() {
  return requestWithFallback("get", ["/users/me", "/auth/me"]);
}

export async function fetchJobs(params = {}) {
  const response = await api.get("/jobs", { params });
  const hiddenJobLabels = ["live role", "live roles", "offer role", "offer roles", "debug role", "debug roles"];
  return (response.data || []).filter((job) => {
    const searchableText = [job.title, job.companyName, job.description].filter(Boolean).join(" ").toLowerCase();
    return !hiddenJobLabels.some((label) => searchableText.includes(label));
  });
}

export async function fetchJobById(id) {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
}

export async function fetchDashboard() {
  return requestWithFallback("get", ["/users/dashboard"]);
}

export async function updateProfile(payload) {
  return requestWithFallback("put", ["/users/profile"], payload);
}

export async function forgotPassword(payload) {
  return requestWithFallback("post", ["/auth/forgot-password", "/users/forgot-password"], payload);
}

export async function resetPassword(token, payload) {
  return requestWithFallback("post", [`/auth/reset-password/${token}`, `/users/reset-password/${token}`], payload);
}

export async function applyToJob(payload) {
  return requestWithFallback("post", ["/apply"], payload);
}

export async function fetchApplications() {
  const response = await requestWithFallback("get", ["/apply"]);
  return response;
}

export async function updateApplicationStatus(id, payload) {
  return requestWithFallback("patch", [`/apply/${id}`], payload);
}

export async function shortlistApplicant(id) {
  return requestWithFallback("post", [`/apply/${id}/shortlist`]);
}

export async function rejectApplicant(id) {
  return requestWithFallback("post", [`/apply/${id}/reject`]);
}

export async function scheduleInterview(id, payload) {
  return requestWithFallback("post", [`/apply/${id}/interview`], payload);
}

export async function sendOffer(id, payload) {
  return requestWithFallback("post", [`/apply/${id}/offer`], payload);
}

export async function markHired(id) {
  return requestWithFallback("post", [`/apply/${id}/hire`]);
}

export async function withdrawApplication(id) {
  return requestWithFallback("delete", [`/apply/${id}`]);
}

export async function fetchMessages(applicationId) {
  return requestWithFallback("get", [`/apply/${applicationId}/messages`]);
}

export async function sendMessage(applicationId, payload) {
  return requestWithFallback("post", [`/apply/${applicationId}/messages`], payload);
}

export async function fetchNotifications() {
  return requestWithFallback("get", ["/notifications"]);
}

export async function markNotificationRead(notificationId) {
  return requestWithFallback("patch", [`/notifications/${notificationId}/read`]);
}

export async function createJob(payload) {
  return requestWithFallback("post", ["/jobs"], payload);
}

export async function updateJob(id, payload) {
  return requestWithFallback("put", [`/jobs/${id}`], payload);
}

export async function deleteJob(id) {
  return requestWithFallback("delete", [`/jobs/${id}`]);
}

export async function getApplicantsForJob(jobId) {
  return requestWithFallback("get", [`/jobs/${jobId}/applicants`]);
}

export async function getMatchScore(payload) {
  return requestWithFallback("post", ["/match-score"], payload);
}

export function getErrorMessage(error, fallbackMessage = "Something went wrong.") {
  return error?.response?.data?.message || fallbackMessage;
}
