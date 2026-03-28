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

function buildListProjectItem(args: { id: number; ref: string; name: string }) {
  return {
    cloud_provider: 'localhost',
    id: args.id,
    inserted_at: '2021-08-02T06:40:40.646Z',
    is_branch_enabled: false,
    is_physical_backups_enabled: false,
    name: args.name,
    organization_id: 1,
    organization_slug: 'default',
    preview_branch_refs: [] as string[],
    ref: args.ref,
    region: 'local',
    status: 'ACTIVE_HEALTHY',
    subscription_id: null as string | null,
  }
}

const handleGetAll = async (req: NextApiRequest, res: NextApiResponse) => {
  const selfHostedProjects = getAllProjects()

  const listProjects =
    selfHostedProjects.length > 0
      ? selfHostedProjects.map((p, i) =>
          buildListProjectItem({ id: i + 1, ref: p.ref, name: p.name })
        )
      : [buildListProjectItem({ id: 1, ref: DEFAULT_PROJECT.ref, name: DEFAULT_PROJECT.name })]

  const limit = Math.min(100, parseInt(String(req.query.limit ?? '100'), 10) || 100)
  const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0
  const slice = listProjects.slice(offset, offset + limit)
  return res.status(200).json({
    pagination: {
      count: listProjects.length,
      limit,
      offset,
    },
    projects: slice,
  })
}
