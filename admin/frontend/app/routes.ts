import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  // Root index - redirects to login
  index("routes/_index.tsx"),

  // Public routes
  route("login", "routes/client/login1.tsx"), // Use login1.tsx as main login
  route("register", "routes/client/register.tsx"), // New registration page
  route("signup", "routes/client/signup.tsx"), // Keep existing if needed
  route("oauth/callback", "routes/client/oauth-callback.tsx"), // OAuth callback handler
  route("about", "routes/client/about.tsx"), // About us page
  route("contact", "routes/client/contact.tsx"), // Contact page
  route("privacy", "routes/client/privacy.tsx"), // Privacy policy page

  // Dashboard route (default redirects to Home)
  route("dashboard", "routes/client/dashboard/dashboard.tsx", [
    route("", "routes/client/dashboard/redirectHome.tsx"), // Default redirect to home
    route("home", "routes/client/dashboard/home.tsx"),
    route("events", "routes/client/dashboard/events.tsx"),
    route("schedule", "routes/client/dashboard/schedule.tsx"),
    route("profile1", "routes/client/dashboard/profile1.tsx"), // Assignment 2 compliant profile
    route("profile", "routes/client/dashboard/profile.tsx"), // Original profile (backup)
    route("history", "routes/client/dashboard/volunteer-history.tsx"), // Volunteer history page
    
    // Admin-only routes
    route("admin", "routes/client/dashboard/admin/admin-layout.tsx", [
      route("metrics", "routes/client/dashboard/admin/metrics.tsx"),
      route("events", "routes/client/dashboard/admin/event-management.tsx"),
      route("create-event", "routes/client/dashboard/admin/create-event.tsx"),
      route("edit-event/:eventId", "routes/client/dashboard/admin/edit-event.tsx"),
      route("event-volunteers/:eventId", "routes/client/dashboard/admin/event-volunteers.$eventId.tsx"),
      route("matching", "routes/client/dashboard/admin/volunteer-matching.tsx"),
      route("users", "routes/client/dashboard/admin/user-management.tsx"),
      route("volunteer-metrics/:userId", "routes/client/dashboard/admin/volunteer-metrics.$userId.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
