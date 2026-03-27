import { NextApiRequest, NextApiResponse } from 'next'

import { paths } from 'api-types'
import apiWrapper from 'lib/api/apiWrapper'
import { PROJECT_REST_URL } from 'lib/constants/api'
import { getAllProjects, getProjectByRef } from 'lib/api/self-hosted/project-config'

export default (req: NextApiRequest, res: NextApiResponse) => apiWrapper(req, res, handler)

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return handleGet(req, res)
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).json({ data: null, error: { message: `Method ${method} Not Allowed` } })
  }
}

type ResponseData =
  paths['/platform/projects/{ref}/databases']['get']['responses']['200']['content']['application/json']

const handleGet = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { ref } = req.query as { ref: string }

  const selfHostedProjects = getAllProjects()
  if (selfHostedProjects.length > 0) {
    const project = getProjectByRef(ref)
    const dbName = project?.db || 'postgres'

    return res.status(200).json([
      {
        cloud_provider: 'localhost' as any,
        connectionString: '',
        connection_string_read_only: '',
        db_host: '127.0.0.1',
        db_name: dbName,
        db_port: 5432,
        db_user: 'postgres',
        identifier: ref,
        inserted_at: '',
        region: 'local',
        restUrl: PROJECT_REST_URL,
        size: '',
        status: 'ACTIVE_HEALTHY',
      },
    ])
  }

  // Fallback: single default database (original behavior)
  return res.status(200).json([
    {
      cloud_provider: 'localhost' as any,
      connectionString: '',
      connection_string_read_only: '',
      db_host: '127.0.0.1',
      db_name: 'postgres',
      db_port: 5432,
      db_user: 'postgres',
      identifier: 'default',
      inserted_at: '',
      region: 'local',
      restUrl: PROJECT_REST_URL,
      size: '',
      status: 'ACTIVE_HEALTHY',
    },
  ])
}
