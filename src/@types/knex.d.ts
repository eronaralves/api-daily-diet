// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string }
  }
}

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      name: string
      created_at: string
      updated_at: string
    }

    snacks: {
      id: string
      name: string
      description: string
      date: string
      isDiet: boolean | number
      created_at: string
      updated_at: string
      user_id: string
    }
  }
}
