// Small Fetch-API helpers shared by the CMS routes (same shapes as the Cloudflare Worker version,
// so the admin client sees identical responses).

export function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export async function readJsonBody(request) {
  const text = await request.text()
  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch {
    throw httpError(400, 'Invalid JSON body')
  }
}

export function httpError(status, message, extra = {}) {
  const error = new Error(message)
  error.status = status
  error.extra = extra
  return error
}
