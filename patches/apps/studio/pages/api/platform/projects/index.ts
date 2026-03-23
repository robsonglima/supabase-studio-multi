import { NextApiRequest, NextApiResponse } from 'next'

import apiWrapper from 'lib/api/apiWrapper'
import { DEFAULT_PROJECT } from 'lib/constants/api'
import { getAllProjects } from 'lib/api/self-hosted/project-config'

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

const handleGetAll = async (_req: NextApiRequest, res: NextApiResponse) => {
  const selfHostedProjects = getAllProjects()

  if (selfHostedProjects.length > 0) {
    const projects = selfHostedProjects.map((p, i) => ({
      id: i + 1,
      ref: p.ref,
      name: p.name,
      organization_id: 1,
      cloud_provider: 'localhost',
      status: 'ACTIVE_HEALTHY',
      region: 'local',
      inserted_at: '2021-08-02T06:40:40.646Z',
    }))
    return res.status(200).json(projects)
  }

  // Fallback to single default project (original behavior)
  return res.status(200).json([DEFAULT_PROJECT])
}
