import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/events",
    "/events/(.*)",
    "/about",
    "/organizer/(.*)",
    "/api/webhooks/(.*)",
    "/api/organizer/(.*)",
    "/api/events",
    "/api/populate-db",
  ],
  ignoredRoutes: [
    "/api/webhooks/(.*)",
    "/api/organizer/(.*)",
    "/api/events",
    "/api/populate-db",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};