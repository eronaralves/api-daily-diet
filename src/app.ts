import fastify from 'fastify'

// Routes
import { authRoutes } from './routes/auth'
import { snackRoutes } from './routes/snack'

export const app = fastify()

app.register(authRoutes, {
  prefix: 'auth',
})

app.register(snackRoutes, {
  prefix: 'snacks',
})
