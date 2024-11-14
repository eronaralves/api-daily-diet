import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Snacks routes', () => {
  let token = ''

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')

    await request(app.server).post('/auth/sign-up').send({
      name: 'Eronar',
      email: 'eronaralves@gmail.com',
    })

    const response = await request(app.server).post('/auth/sign-in').send({
      name: 'Eronar',
      email: 'eronaralves@gmail.com',
    })

    token = response.body.token
  })

  it('should be able to create a new snack', async () => {
    await request(app.server)
      .post('/snacks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: false,
      })
      .expect(201)
  })

  it('should be able to update a specific snack', async () => {
    const response = await request(app.server)
      .post('/snacks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: false,
      })

    const snackId = response.body.snack.id

    await request(app.server)
      .put(`/snacks/${snackId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: true,
      })
      .expect(200)
  })

  it('should be able to delete a specific snack', async () => {
    const response = await request(app.server)
      .post('/snacks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: false,
      })

    const snackId = response.body.snack.id

    await request(app.server)
      .delete(`/snacks/${snackId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  it('should be able to get a specific snack', async () => {
    const response = await request(app.server)
      .post('/snacks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: false,
      })

    const snackId = response.body.snack.id

    const getTransactionResponse = await request(app.server)
      .get(`/snacks/${snackId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(getTransactionResponse.body.snack).toEqual(
      expect.objectContaining({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: false,
      }),
    )
  })

  it('should be able to list all snacks', async () => {
    await request(app.server)
      .post('/snacks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sanduíche 3',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '2024-11-14T09:30:00.000Z',
        isDiet: false,
      })
  })
})
