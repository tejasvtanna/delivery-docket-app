import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Mark /login and its subroutes as public
const isPublicRoute = createRouteMatcher(['/login(.*)'])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect() // Protect all routes except public ones
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
}
