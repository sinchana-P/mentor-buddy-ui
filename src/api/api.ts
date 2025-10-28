// Centralized API configuration following your reference pattern
import {
  createApi,
  fetchBaseQuery,
  retry,
} from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getIdToken, getJWTToken, removeJWTToken } from "../utils/jwt-tokens";
import { VITE_API_BACKEND_URL } from "./baseURL";
import { getCommonHeaders } from "@/utils/commonHeaders";
import hmacSHA512 from "crypto-js/hmac-sha512";

// Routes that use ID token instead of JWT token
const routesUsingIdToken = [
  "getAccessToken",
  "getUserInfo", 
  "getUserSettings",
  "signOut",
  "changePassword",
];

// Replace with your actual secret key in env
const SECRET_KEY = import.meta.env.VITE_JWS_SIGNATURE_SECRET_KEY || "MENTOR_BUDDY_SECRET_KEY";

export type BaseQueryArgs = {
  request: unknown;
  optionalParams?: unknown;
};

export const mentorBuddyBaseUrl = VITE_API_BACKEND_URL as string;

export const generateSignature = (data: {
  body: unknown;
  url: URL;
  method: string;
  token: string | undefined;
  headers?: FetchArgs["headers"];
}) => {
  const parts = [];

  // URL is required
  parts.push(data.url.toString());

  // Add token if present and not empty
  if (data.token?.trim()) {
    parts.push(data.token);
  }

  // Method is required
  parts.push(data.method);

  // Add body if present and not empty
  if (data.body && Object.keys(data.body).length > 0) {
    parts.push(JSON.stringify(data.body));
  }

  // Add "x-user-id" header if it exists
  if (data.headers && "x-user-id" in data.headers) {
    parts.push(data.headers["x-user-id"]);
  }

  const dataToSign = parts.join("");
  return hmacSHA512(dataToSign, SECRET_KEY).toString();
};

export const getMethodOrDefault = (method?: string) => {
  if (typeof method === "string") return method;
  else return "GET";
};

export const getBodyOrDefault = (method: string, body?: unknown) => {
  if (method.toUpperCase() === "GET") return undefined;
  return body;
};

// Note: Complex base query with signature auth is defined below but currently not used

// Create a function that wraps a base query with token refresh logic
const withTokenRefresh = (
  baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // Handle 401 responses (invalid/expired tokens)
      console.warn('401 Unauthorized - redirecting to auth page');

      // Redirect to auth page - user will need to log in again
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }

    return result;
  };
};

export const withSignatureBaseQuery = (
  baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  baseUrl: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    const { endpoint } = api;
    const token = routesUsingIdToken.includes(endpoint)
      ? getIdToken()?.id_token
      : getJWTToken()?.access_token;

    const fetchArgs: FetchArgs =
      typeof args === "string" ? { url: args } : args;

    // Build full URL
    const url = fetchArgs.url.startsWith("/")
      ? new URL(baseUrl + fetchArgs.url)
      : new URL(baseUrl + "/" + fetchArgs.url);

    if (fetchArgs.params) {
      for (const [key, value] of Object.entries(fetchArgs.params)) {
        url.searchParams.append(key, value as string);
      }
    }

    // Normalize headers from fetchArgs
    const inputHeaders: Record<string, string> = (() => {
      const raw = fetchArgs.headers;
      if (!raw) return {};
      if (raw instanceof Headers) {
        const result: Record<string, string> = {};
        raw.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      }
      if (Array.isArray(raw)) {
        return Object.fromEntries(raw);
      }
      return raw as Record<string, string>;
    })();

    // Prepare data for signature
    const method = getMethodOrDefault(fetchArgs.method);
    const body = getBodyOrDefault(method, fetchArgs.body);

    const data = {
      body,
      url,
      method,
      token,
      headers: inputHeaders,
    };

    const signature = generateSignature(data);
    const common = getCommonHeaders();

    const headers: Record<string, string> = {
      ...common,
      ...inputHeaders,
      ...(common["X-APP-ID"] && !inputHeaders["X-APP-ID"]
        ? { "X-APP-ID": common["X-APP-ID"] }
        : {}),
      ...(common["X-APP-NAME"] && !inputHeaders["X-APP-NAME"]
        ? { "X-APP-NAME": common["X-APP-NAME"] }
        : {}),
      "X-Request-Signature": signature,
    };

    return baseQuery(
      {
        ...fetchArgs,
        headers,
      },
      api,
      extraOptions,
    );
  };
};

// Simplified base query for testing without signature complexity
const simpleBaseQuery = fetchBaseQuery({
  baseUrl: mentorBuddyBaseUrl,
  credentials: 'include',
  timeout: 15000,
  prepareHeaders: (headers, { endpoint, getState }) => {
    headers.set("Content-Type", "application/json");

    const nonAuthEndpoints = ["signIn", "signUp"];
    if (!nonAuthEndpoints.includes(endpoint)) {
      // Get token from Redux store instead of localStorage
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Add basic headers for CORS
    headers.set("x-app-name", "Mentor Buddy Management System");
    headers.set("x-app-id", "mentor-buddy-app");

    return headers;
  },
});

// Main API slice with simplified query
export const api = createApi({
  reducerPath: "mentorBuddyApi",
  baseQuery: withTokenRefresh(retry(simpleBaseQuery, { maxRetries: 2 })),
  tagTypes: [
    "Users",
    "Mentors",
    "Buddies",
    "Tasks",
    "Resources",
    "DashboardStats",
    "DashboardActivity",
    "Settings",
    "Progress",
    "Portfolio",
    "Portfolios",
    "Submissions",
    "BuddyTopics",
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});

// Export as baseApi for endpoint injection
export const baseApi = api;

export default api;