import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import type { FastifyInstance } from 'fastify'

import jwt from 'jsonwebtoken'
import { env } from '../env'

export async function authRoutes(app: FastifyInstance) {
  app.post('/sign-up', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const bodyParse = createUserBodySchema.safeParse(req.body)

    if (bodyParse.success === false) {
      return res.status(400).send({
        message: 'email and name fields are required',
      })
    }

    const { email, name } = bodyParse.data

    const existingUser = await knex('users').where({ email }).first()

    if (existingUser) {
      return res.status(400).send({
        message: 'User already created with this email',
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      email,
      name,
    })

    return res.status(201).send({
      message: 'User created successfully!',
    })
  })

  app.post('/sign-in', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const bodyParse = createUserBodySchema.safeParse(req.body)

    if (bodyParse.success === false) {
      return res.status(400).send({
        message: 'email and name fields are required',
      })
    }

    const { email, name } = bodyParse.data

    const user = await knex('users').where({ email, name }).first()

    if (!user) {
      return res.status(400).send({
        message: 'User not found',
      })
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET_SIGNATURE, {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    })

    return { token }
  })
}
