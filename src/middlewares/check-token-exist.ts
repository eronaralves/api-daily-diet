import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { env } from '../env'
import { knex } from '../database'

interface JwtPayload {
  id: string
}

export async function checkTokenExist(req: FastifyRequest, res: FastifyReply) {
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }

  const token = authorization.split(' ')[1]
  const { id } = jwt.verify(token, env.JWT_SECRET_SIGNATURE) as JwtPayload

  const user = await knex('users').where({ id }).first()

  if (!user) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }

  req.user = { id }
}
