// services/authService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import { useUserStore } from "@/stores/userStore";

export interface Assignment {
  _id: string;
  title: string;
  institutionName: string;
  classLevel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupData {
  name: string;
  emailOrPhone: string;
  institutionName: string;
  password: string;
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  emailOrPhone: string;
  institutionName: string;
  location?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
  assignments: Assignment[];
}

// Signup
export async function signup(data: SignupData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Signup failed");
  }
  const response: AuthResponse = await res.json();
  storeToken(response.token);
  useUserStore.getState().setUser(response.user);
  return response;
}

// Login
export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }
  const response: AuthResponse = await res.json();
  storeToken(response.token);
  useUserStore.getState().setUser(response.user);
  return response;
}

// Get current user (with token)
export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  const data: MeResponse = await res.json();
  useUserStore.getState().setUser(data.user);
  return data;
}

// Store token in localStorage
export function storeToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
  useUserStore.getState().clearUser();
}
