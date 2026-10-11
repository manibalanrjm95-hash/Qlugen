// Image type detection and dimensions from the file bytes (no image libraries). Copied unchanged
// from the Cloudflare Worker's media service (worker/src/services/media.js), which is kept only for
// rollback until the Firebase migration is verified.
export function sniffImageType(bytes) {
  const ascii = (start, end) => String.fromCharCode(...bytes.subarray(start, end))

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)) return 'image/png'
  if (bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp'
  if (bytes.length >= 16 && ascii(4, 8) === 'ftyp') {
    const boxSize = Math.min(readUint32BE(bytes, 0), bytes.length, 64)
    const brands = [ascii(8, 12)]
    for (let offset = 16; offset + 4 <= boxSize; offset += 4) brands.push(ascii(offset, offset + 4))
    if (brands.includes('avif') || brands.includes('avis')) return 'image/avif'
  }
  return null
}

export function readImageDimensions(bytes, type) {
  try {
    if (type === 'image/png') return pngDimensions(bytes)
    if (type === 'image/jpeg') return jpegDimensions(bytes)
    if (type === 'image/webp') return webpDimensions(bytes)
    if (type === 'image/avif') return avifDimensions(bytes)
  } catch {
    // Dimensions are optional metadata; fall through.
  }
  return { width: null, height: null }
}

function pngDimensions(bytes) {
  return { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) }
}

function jpegDimensions(bytes) {
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = bytes[offset + 1]
    if (marker === 0xff) {
      offset += 1
      continue
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2
      continue
    }
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    if (isStartOfFrame) {
      return { height: readUint16BE(bytes, offset + 5), width: readUint16BE(bytes, offset + 7) }
    }
    offset += 2 + readUint16BE(bytes, offset + 2)
  }
  return { width: null, height: null }
}

function webpDimensions(bytes) {
  const chunk = String.fromCharCode(...bytes.subarray(12, 16))
  if (chunk === 'VP8 ') {
    return { width: readUint16LE(bytes, 26) & 0x3fff, height: readUint16LE(bytes, 28) & 0x3fff }
  }
  if (chunk === 'VP8L') {
    const [b0, b1, b2, b3] = bytes.subarray(21, 25)
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    }
  }
  if (chunk === 'VP8X') {
    return { width: 1 + readUint24LE(bytes, 24), height: 1 + readUint24LE(bytes, 27) }
  }
  return { width: null, height: null }
}

function avifDimensions(bytes) {
  // Use the largest image spatial extent ("ispe") box; grid images also carry smaller tile extents.
  let best = { width: null, height: null }
  const limit = Math.min(bytes.length - 16, 256 * 1024)
  for (let offset = 4; offset < limit; offset += 1) {
    if (bytes[offset] === 0x69 && bytes[offset + 1] === 0x73 && bytes[offset + 2] === 0x70 && bytes[offset + 3] === 0x65) {
      const width = readUint32BE(bytes, offset + 8)
      const height = readUint32BE(bytes, offset + 12)
      if (width * height > (best.width || 0) * (best.height || 0)) best = { width, height }
    }
  }
  return best
}

function readUint16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

function readUint16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function readUint24LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)
}

function readUint32BE(bytes, offset) {
  return ((bytes[offset] << 24) >>> 0) + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
}

