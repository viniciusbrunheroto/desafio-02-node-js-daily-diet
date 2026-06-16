import { afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest'
import { app } from '../src/app.js'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('users route', () => {
    
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })
    
    
  it('should be able to create a new account', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')])
    )
  })
})