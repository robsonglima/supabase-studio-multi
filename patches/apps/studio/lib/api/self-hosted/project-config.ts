/**
 * Multi-project support for self-hosted Supabase Studio.
 * Projects are configured via the PROJECTS_CONFIG environment variable (JSON array).
 *
 * Example PROJECTS_CONFIG:
 * [
 *   {
 *     "ref": "rikus-money",
 *     "name": "Rikus Money",
 *     "db": "rikus_money",
 *     "auth_url": "http://auth-rikus-money:9999",
 *     "anon_key": "eyJ...",
 *     "service_key": "eyJ...",
 *     "jwt_secret": "..."
 *   }
 * ]
 */

export interface SelfHostedProject {
  ref: string
  name: string
  db: string
  auth_url: string
  anon_key: string
  service_key: string
  jwt_secret: string
}

let _cachedProjects: SelfHostedProject[] | null = null

export function getAllProjects(): SelfHostedProject[] {
  if (_cachedProjects !== null) return _cachedProjects
  try {
    const raw = process.env.PROJECTS_CONFIG
    if (!raw) {
      _cachedProjects = []
      return []
    }
    _cachedProjects = JSON.parse(raw) as SelfHostedProject[]
    return _cachedProjects
  } catch {
    _cachedProjects = []
    return []
  }
}

export function getProjectByRef(ref: string): SelfHostedProject | undefined {
  if (!ref || ref === 'default') return undefined
  return getAllProjects().find((p) => p.ref === ref)
}

import CryptoJS from 'crypto-js'

// Returns a CryptoJS-AES-encrypted connection string for use with the
// x-connection-encrypted header expected by pg-meta.
export function buildEncryptedConnectionString(db: string): string {
  const cryptoKey = process.env.PG_META_CRYPTO_KEY || ''
  const user = process.env.POSTGRES_USER_READ_WRITE || 'supabase_admin'
  const password = process.env.POSTGRES_PASSWORD || ''
  const host = process.env.POSTGRES_HOST || 'db'
  const port = process.env.POSTGRES_PORT || '5432'
  const connStr = `postgresql://${user}:${password}@${host}:${port}/${db}`
  return CryptoJS.AES.encrypt(connStr, cryptoKey).toString()
}

export function getProjectAuthUrl(ref: string, path: string): string {
  const project = getProjectByRef(ref)
  if (project?.auth_url) {
    // auth_url is the GoTrue base (e.g. http://auth-rikus-money:9999)
    return `${project.auth_url.replace(/\/$/, '')}/${path}`
  }
  return `${process.env.SUPABASE_URL}/auth/v1/${path}`
}

export function getProjectServiceKey(ref: string): string {
  const project = getProjectByRef(ref)
  return project?.service_key || process.env.SUPABASE_SERVICE_KEY || ''
}

export function getProjectAnonKey(ref: string): string {
  const project = getProjectByRef(ref)
  return project?.anon_key || process.env.SUPABASE_ANON_KEY || ''
}

export function getProjectJwtSecret(ref: string): string {
  const project = getProjectByRef(ref)
  return project?.jwt_secret || process.env.AUTH_JWT_SECRET || ''
}
