import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Allowlist: tudo que NAO estiver aqui exige sessao. Rotas novas nascem
// privadas por padrao — antes o prefixo /protected era a unica pista de
// "isto e privado", e ele nao existe mais na URL.
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/candidate/sign-in(.*)',
])

// As rotas de API ficam de fora do protect() de proposito: protect() responde
// com redirect para o sign-in, e um cliente de API espera o 401/403 em JSON que
// withApi() + requireRole() ja devolvem. A autorizacao delas segue na handler.
const isApiRoute = createRouteMatcher(['/api(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isApiRoute(request) || isPublicRoute(request)) return
  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
