// The Worker in front of the static site. Everything under /api is answered
// here so a stray request gets JSON instead of the SPA shell; every other
// request is handed to the built assets.
type Env = {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/health') return Response.json({ ok: true })
    if (pathname.startsWith('/api/')) return Response.json({ error: 'Not found' }, { status: 404 })
    return env.ASSETS.fetch(request)
  },
}
