import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Auth routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('it should be able to create user', async () => {
    await request(app.server)
      .post('/auth/sign-up')
      .send({
        name: 'Eronar',
        email: 'eronaralves@gmail.com',
      })
      .expect(201)
  })

  it('it should be able to authenticate', async () => {
    await request(app.server).post('/auth/sign-up').send({
      name: 'Eronar',
      email: 'eronaralves@gmail.com',
    })

    await request(app.server)
      .post('/auth/sign-in')
      .send({
        name: 'Eronar',
        email: 'eronaralves@gmail.com',
      })
      .expect(200)
  })
})
