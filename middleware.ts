import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/events/:id',
  '/events/:id/checkout',
  '/events',
  '/api/webhooks',
  '/api/webhooks/(.*)',
  '/api/uploadthing',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// The route matcher defines routes that should be protected
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Fetch the user's role from the session claims
  const userRole = (await auth()).sessionClaims?.metadata?.role;

  // Protect all routes starting with `/admin`
  if (isAdminRoute(request) && !(userRole === 'admin')) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
