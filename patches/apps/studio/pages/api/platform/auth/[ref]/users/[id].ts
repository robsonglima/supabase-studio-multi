import { NextApiRequest, NextApiResponse } from 'next'

import apiWrapper from 'lib/api/apiWrapper'
import { getProjectAuthUrl, getProjectServiceKey } from 'lib/api/self-hosted/project-config'

export default (req: NextApiRequest, res: NextApiResponse) => apiWrapper(req, res, handler)

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return handleGet(req, res)
    case 'PUT':
    case 'PATCH':
      return handleUpdate(req, res)
    case 'DELETE':
      return handleDelete(req, res)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE'])
      res.status(405).json({ data: null, error: { message: `Method ${method} Not Allowed` } })
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref, id } = req.query as Record<string, string>
  const serviceKey = getProjectServiceKey(ref)
  const url = getProjectAuthUrl(ref, `admin/users/${id}`)

  const response = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  const data = await response.json()
  return res.status(response.status).json(data)
}

const handleUpdate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref, id } = req.query as Record<string, string>
  const serviceKey = getProjectServiceKey(ref)
  const url = getProjectAuthUrl(ref, `admin/users/${id}`)

  const response = await fetch(url, {
    method: 'PUT',
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

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref, id } = req.query as Record<string, string>
  const serviceKey = getProjectServiceKey(ref)
  const url = getProjectAuthUrl(ref, `admin/users/${id}`)

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  if (response.status === 204) return res.status(200).json({})
  const data = await response.json()
  return res.status(response.status).json(data)
}
