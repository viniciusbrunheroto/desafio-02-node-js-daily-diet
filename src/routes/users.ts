import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { knex } from '../database.js'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req,res) =>{

    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.email()
    })

    const {name, email} = createUserBodySchema.parse(req.body)
    

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })

    }

    let emailAlreadyExists = await knex('users').where({email}).first()

    if (emailAlreadyExists) {
      return res.status(400).send({ message: 'User already exists'})
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return res.status(201).send()
  })
}