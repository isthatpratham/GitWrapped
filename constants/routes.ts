export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  CALLBACK: "/callback",
  DASHBOARD: "/dashboard",
  WRAPPED: (id: string) => `/wrapped/${id}`,
} as const;

export const API_ROUTES = {
  OAUTH_AUTHORIZE: "https://github.com/login/oauth/authorize",
  OAUTH_ACCESS_TOKEN: "https://github.com/login/oauth/access_token",
  WRAPPED: "/api/wrapped",
} as const;
