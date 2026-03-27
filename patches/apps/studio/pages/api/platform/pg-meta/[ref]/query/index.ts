import { constructHeaders } from 'lib/api/apiHelpers'
import apiWrapper from 'lib/api/apiWrapper'
import { buildEncryptedConnectionString, getProjectByRef } from 'lib/api/self-hosted/project-config'
import { executeQuery } from 'lib/api/self-hosted/query'
import { PgMetaDatabaseError } from 'lib/api/self-hosted/types'
import { PG_META_URL } from 'lib/constants'
import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) =>
  apiWrapper(req, res, handler, { withAuth: true })

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      return handlePost(req, res)
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).json({ error: { message: `Method ${method} Not Allowed` } })
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref } = req.query as { ref: string }
  const { query } = req.body
  const headers = constructHeaders(req.headers)

  // For project-specific databases, call pg-meta directly with encrypted connection string
  const project = getProjectByRef(ref)
  if (project?.db) {
    const connectionStringEncrypted = buildEncryptedConnectionString(project.db)
    const requestBody: { query: string; parameters?: unknown[] } = { query }
    if (req.body.parameters !== undefined) {
      requestBody.parameters = req.body.parameters
    }

    const response = await fetch(`${PG_META_URL}/query`, {
      method: 'POST',
      headers: constructHeaders({
        ...headers,
        'Content-Type': 'application/json',
        'x-connection-encrypted': connectionStringEncrypted,
      }),
      body: JSON.stringify(requestBody),
    })

    const result = await response.json()
    return res.status(response.status).json(result)
  }

  // Default project: use the standard executeQuery path
  const { data, error } = await executeQuery({ query, headers })

  if (error) {
    if (error instanceof PgMetaDatabaseError) {
      const { statusCode, message, formattedError } = error
      return res.status(statusCode).json({ message, formattedError })
    }
    const { message } = error
    return res.status(500).json({ message, formattedError: message })
  } else {
    return res.status(200).json(data)
  }
}
