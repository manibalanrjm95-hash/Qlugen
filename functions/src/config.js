import { defineString } from 'firebase-functions/params'

// Deployment settings (set per project in functions/.env.<project> or answered at deploy time;
// local runs read functions/.env.local). None of these are secrets.
//
//   CMS_ADMIN_UIDS       comma-separated Firebase UIDs allowed into the CMS (recommended)
//   CMS_ALLOWED_ORIGINS  comma-separated browser origins allowed to call the admin API
//                        (e.g. https://qlugen.in,https://www.qlugen.in)
//   CMS_AUTH_DISABLED    temporary emergency switch. "true" makes /api/admin/* public.
export const REGION = 'asia-south1'

const adminUids = defineString('CMS_ADMIN_UIDS', { default: '' })
const allowedOrigins = defineString('CMS_ALLOWED_ORIGINS', { default: '' })
const authDisabled = defineString('CMS_AUTH_DISABLED', { default: 'false' })

export function settings() {
  return {
    adminUids: list(adminUids.value()),
    allowedOrigins: list(allowedOrigins.value()).map(origin => origin.replace(/\/+$/, '')),
    authDisabled: authDisabled.value() === 'true',
  }
}

function list(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean)
}
