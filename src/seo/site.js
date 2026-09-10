// Set once the production custom domain (including www preference) is confirmed.
// Do not derive canonical URLs from the current browser or Firebase host.
export const productionOrigin = import.meta.env.VITE_ORIGIN || null
