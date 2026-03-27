import { NextApiRequest, NextApiResponse } from 'next'

import apiWrapper from 'lib/api/apiWrapper'
import { getAllProjects, type SelfHostedProject } from 'lib/api/self-hosted/project-config'

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

function buildOrgProject(p: SelfHostedProject) {
  return {
    cloud_provider: 'localhost',
    databases: [
      {
        cloud_provider: 'localhost',
        identifier: p.ref,
        region: 'local',
        status: 'ACTIVE_HEALTHY' as const,
        type: 'PRIMARY' as const,
      },
    ],
    inserted_at: '2021-08-02T06:40:40.646Z',
    is_branch: false,
    name: p.name,
    ref: p.ref,
    region: 'local',
    status: 'ACTIVE_HEALTHY' as const,
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '100'), 10) || 100)
  const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0

  const selfHostedProjects = getAllProjects()

  const allProjects =
    selfHostedProjects.length > 0
      ? selfHostedProjects.map((p) => buildOrgProject(p))
      : [
          {
            cloud_provider: 'localhost',
            databases: [
              {
                cloud_provider: 'localhost',
                identifier: 'default',
                region: 'local',
                status: 'ACTIVE_HEALTHY' as const,
                type: 'PRIMARY' as const,
              },
            ],
            inserted_at: '2021-08-02T06:40:40.646Z',
            is_branch: false,
            name: process.env.DEFAULT_PROJECT_NAME || 'Default Project',
            ref: 'default',
            region: 'local',
            status: 'ACTIVE_HEALTHY' as const,
          },
        ]

  const slice = allProjects.slice(offset, offset + limit)

  return res.status(200).json({
    pagination: {
      count: allProjects.length,
      limit,
      offset,
    },
    projects: slice,
  })
}
