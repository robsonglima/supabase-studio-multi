import { NextApiRequest, NextApiResponse } from 'next'

import apiWrapper from 'lib/api/apiWrapper'
import { DEFAULT_PROJECT } from 'lib/constants/api'
import { getAllProjects, getProjectByRef } from 'lib/api/self-hosted/project-config'

export default (req: NextApiRequest, res: NextApiResponse) => apiWrapper(req, res, handler)

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return handleGetAll(req, res)
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).json({ data: null, error: { message: `Method ${method} Not Allowed` } })
  }
}

const handleGetAll = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref } = req.query as { ref: string }

  const selfHostedProjects = getAllProjects()

  if (selfHostedProjects.length > 0) {
    const project = getProjectByRef(ref)
    if (project) {
      const idx = selfHostedProjects.findIndex((p) => p.ref === ref)
      return res.status(200).json({
        project: {
          id: idx + 1,
          ref: project.ref,
          name: project.name,
          organization_id: 1,
          cloud_provider: 'localhost',
          status: 'ACTIVE_HEALTHY',
          region: 'local',
          inserted_at: '2021-08-02T06:40:40.646Z',
          services: [],
        },
      })
    }
  }

  // Fallback: single default project (original behavior)
  return res.status(200).json({
    project: {
      ...DEFAULT_PROJECT,
      services: [],
    },
  })
}
