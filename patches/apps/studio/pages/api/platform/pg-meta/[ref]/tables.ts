import { NextApiRequest, NextApiResponse } from 'next'

import { fetchGet } from 'data/fetchers'
import { constructHeaders } from 'lib/api/apiHelpers'
import apiWrapper from 'lib/api/apiWrapper'
import { PG_META_URL } from 'lib/constants'
import { buildEncryptedConnectionString, getProjectByRef } from 'lib/api/self-hosted/project-config'

export default (req: NextApiRequest, res: NextApiResponse) =>
  apiWrapper(req, res, handler, { withAuth: true })

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return handleGetAll(req, res)
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).json({ error: { message: `Method ${method} Not Allowed` } })
  }
}

/**
 * Build the pg-meta redirect URL, injecting a project-specific encrypted
 * connection string when the request targets a non-default project ref.
 */
export function getPgMetaRedirectUrl(req: NextApiRequest, endpoint: string) {
  const { ref, ...restQuery } = req.query as Record<string, string | string[]>

  const query = Object.entries(restQuery).reduce((q, [key, value]) => {
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, v)
    } else if (value) {
      q.set(key, value)
    }
    return q
  }, new URLSearchParams())

  // For project-specific databases, inject the encrypted connection string
  const project = getProjectByRef(ref as string)
  if (project?.db) {
    query.set('pg', buildEncryptedConnectionString(project.db))
  }

  let url = `${PG_META_URL}/${endpoint}`
  const qs = query.toString()
  if (qs) url += `?${qs}`
  return url
}

const handleGetAll = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = constructHeaders(req.headers)
  const response = await fetchGet(getPgMetaRedirectUrl(req, 'tables'), { headers })

  if (response.error) {
    const { code, message } = response.error
    return res.status(code).json({ message })
  } else {
    return res.status(200).json(response)
  }
}
