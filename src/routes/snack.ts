import type { FastifyInstance } from 'fastify'
import { checkTokenExist } from '../middlewares/check-token-exist'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function snackRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: checkTokenExist,
    },
    async (req, res) => {
      const createSnackBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isDiet: z.boolean(),
      })

      const { name, description, date, isDiet } = createSnackBodySchema.parse(
        req.body,
      )

      const snack = await knex('snacks')
        .insert({
          id: randomUUID(),
          name,
          date,
          description,
          isDiet,
          user_id: req.user?.id,
        })
        .returning('*')

      return res.status(201).send({ snack: snack[0] })
    },
  )

  app.get(
    '/',
    {
      preHandler: checkTokenExist,
    },
    async (req) => {
      const snacks = await knex('snacks')
        .where({ user_id: req.user?.id })
        .orderBy('date')
        .select('id', 'name', 'description', 'date', 'isDiet')

      const snacksFormmater = snacks.map((snack) => ({
        ...snack,
        isDiet: snack.isDiet === 1,
      }))

      return { result: snacksFormmater }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: checkTokenExist,
    },
    async (req, res) => {
      const getSnackParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getSnackParamsSchema.parse(req.params)

      const snack = await knex('snacks')
        .where({ id, user_id: req.user?.id })
        .first()
        .select('id', 'name', 'description', 'date', 'isDiet')

      if (!snack) {
        return res.status(401).send({
          message: 'Snack not found',
        })
      }

      const snacksFormmater = {
        ...snack,
        isDiet: snack.isDiet === 1,
      }

      return { snack: snacksFormmater }
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: checkTokenExist,
    },
    async (req) => {
      const countSnacks = (await knex('snacks')
        .where({ user_id: req.user?.id })
        .first()
        .count('* as count')) as { count: number }

      const countSnackIsDiet = (await knex('snacks')
        .where({
          user_id: req.user?.id,
          isDiet: true,
        })
        .first()
        .count('* as count')) as { count: number }

      const countSnackOffDiet = await knex('snacks')
        .where({
          user_id: req.user?.id,
          isDiet: false,
        })
        .first()
        .count('* as count')

      const snacksOrderByDate = await knex('snacks')
        .where({
          user_id: req.user?.id,
        })
        .orderBy('date')

      let maxStreak = 0
      let currentStreak = 0

      snacksOrderByDate.forEach((snack) => {
        if (snack.isDiet) {
          currentStreak += 1
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      })

      return {
        metrics: {
          countSnacks,
          countSnackIsDiet: {
            count: countSnackIsDiet.count,
            porcentage: (countSnackIsDiet.count / countSnacks.count) * 100,
            sequence: maxStreak,
          },
          countSnackOffDiet,
        },
      }
    },
  )

  app.put(
    '/:id',
    {
      preHandler: checkTokenExist,
    },
    async (req, res) => {
      const updatdenackParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = updatdenackParamsSchema.parse(req.params)

      const uptadeSnackBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        isDiet: z.boolean().optional(),
      })

      const { name, description, date, isDiet } = uptadeSnackBodySchema.parse(
        req.body,
      )

      const snack = await knex('snacks')
        .where({ id, user_id: req.user?.id })
        .update({
          name,
          date,
          description,
          isDiet,
          user_id: req.user?.id,
        })
        .returning('*')

      if (snack.length === 0) {
        return res.status(401).send({
          message: 'Snack not found',
        })
      }

      const snacksFormmater = {
        ...snack[0],
        isDiet: snack[0].isDiet === 1,
      }

      return res.status(200).send({ snack: snacksFormmater })
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: checkTokenExist,
    },
    async (req, res) => {
      const deleteParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteParamsSchema.parse(req.params)

      await knex('snacks').where({ id, user_id: req.user?.id }).del()

      return res.status(204).send()
    },
  )
}
