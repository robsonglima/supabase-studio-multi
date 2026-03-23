import { NextApiRequest, NextApiResponse } from 'next'

import apiWrapper from 'lib/api/apiWrapper'
import { getProjectAuthUrl, getProjectServiceKey } from 'lib/api/self-hosted/project-config'

export default (req: NextApiRequest, res: NextApiResponse) => apiWrapper(req, res, handler)

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ data: null, error: { message: `Method ${method} Not Allowed` } })
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref, page, per_page } = req.query as Record<string, string>
  const serviceKey = getProjectServiceKey(ref)
  const params = new URLSearchParams()
  if (page) params.set('page', page)
  if (per_page) params.set('per_page', per_page)

  const url = getProjectAuthUrl(ref, `admin/users?${params.toString()}`)
  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  })
  const data = await response.json()
  return res.status(response.status).json(data)
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref } = req.query as Record<string, string>
  const serviceKey = getProjectServiceKey(ref)
  const url = getProjectAuthUrl(ref, 'admin/users')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(req.body),
  })
  const data = await response.json()
  return res.status(response.status).json(data)
}
