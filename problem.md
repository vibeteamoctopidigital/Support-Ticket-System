Multi-Session Authentication Problem

I'm facing an issue with my authentication flow in a multi-role application.

Current Behavior
An Admin logs into the application.
The application stores the Admin access token and refresh token.
When navigating to /admin/*, everything works correctly because the Admin token is used.
However, when I switch to the Team section, the application still sends the Admin access token with API requests.

As a result, the backend validates the Admin JWT and returns the Admin profile, even though I'm currently in the Team dashboard.

What I Want

I want the Admin and Team sessions to be completely independent, allowing both accounts to stay logged in simultaneously in the same browser.

For example:

Admin Login
↓
admin-access-token
admin-refresh-token

Team Login (or Team Switch)
↓
team-access-token
team-refresh-token

Then the frontend should automatically use the correct token based on the current route.

/admin/*
    → Use admin-access-token

/team/*
    → Use team-access-token

For example, the Axios interceptor should determine which token to attach:

const pathname = window.location.pathname;

if (pathname.startsWith("/team")) {
  token = getCookie("team-access-token");
} else {
  token = getCookie("admin-access-token");
}

config.headers.Authorization = `Bearer ${token}`;

On the backend:

GET /admin/profile should verify the Admin JWT only.
GET /team/profile should verify the Team JWT only.

This ensures that the Team dashboard never receives Admin data and vice versa.

Desired Architecture

I believe the cleanest approach is to maintain separate authentication states for each role.

AdminAuthStore
- admin
- adminAccessToken
- adminRefreshToken

TeamAuthStore
- team
- teamAccessToken
- teamRefreshToken

Then:

/admin/* uses only the AdminAuthStore.
/team/* uses only the TeamAuthStore.

This allows both Admin and Team accounts to remain logged in simultaneously within the same browser session without mixing authentication state or user data.

This is a common authentication pattern in SaaS applications that support multiple independent user sessions.