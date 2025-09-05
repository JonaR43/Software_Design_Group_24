import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/client/login.tsx"),
  route("dashboard", "routes/client/dashboard.tsx"),
  route("signup", "routes/client/signup.tsx"),
  route("profilepage", "routes/client/profilepage.tsx"),
] satisfies RouteConfig;
