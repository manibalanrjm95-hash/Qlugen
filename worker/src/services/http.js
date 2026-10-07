export function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function readJsonBody(request) {
  const text = await request.text()
  if (!text.trim()) return null

  try {
    return JSON.parse(text)
  } catch {
    const error = new Error('Invalid JSON body')
    error.status = 400
    throw error
  }
}

export function httpError(status, message, extra = {}) {
  const error = new Error(message)
  error.status = status
  error.extra = extra
  return error
}
