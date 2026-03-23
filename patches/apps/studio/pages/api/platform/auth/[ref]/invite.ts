import { NextApiRequest, NextApiResponse } from 'next'

import apiWrapper from 'lib/api/apiWrapper'
import { getProjectAuthUrl, getProjectServiceKey } from 'lib/api/self-hosted/project-config'

export default (req: NextApiRequest, res: NextApiResponse) => apiWrapper(req, res, handler)

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      return handlePost(req, res)
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).json({ data: null, error: { message: `Method ${method} Not Allowed` } })
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ref } = req.query as Record<string, string>
  const serviceKey = getProjectServiceKey(ref)
  const url = getProjectAuthUrl(ref, 'invite')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ email: req.body.email }),
  })
  const data = await response.json()
  return res.status(response.status).json(data)
}
