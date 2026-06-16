import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { execSync } from 'child_process'
import request from 'supertest'

describe('meals routes', () => {
    
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
    
    
  it('should be able to register a new meal', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Café da manhã',
        description: 'Descrição de teste',
        diet: true,
        datetime: new Date(),
      }).expect(201)

  }),
  it('should be able to list all users meals', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Café da manhã',
        description: 'Descrição de teste',
        diet: true,
        datetime: new Date('2026-06-15T08:00:00'),
      }).expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Salmão com salada',
        description: 'Descrição do almoço',
        diet: true,
        datetime: new Date('2026-06-15T12:15:00'),
      }).expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Hambúrguer',
        description: 'Descrição do jantar',
        diet: false,
        datetime: new Date('2026-06-16T18:35:00'),
      }).expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!!)

    expect(listMealsResponse.body.meals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({name: 'Café da manhã'}),
        expect.objectContaining({name: 'Salmão com salada'}),
        expect.objectContaining({name: 'Hambúrguer'}),
      ])
    )
  }),
  it('should be able to edit a meal', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Café da manhã',
        description: 'Descrição de teste',
        diet: true,
        datetime: new Date(),
      }).expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!!)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies!!)
      .send({
        name: 'Filé de Frango à Parmegiana',
        description: 'Frango, molho e queijo',
        diet: false,
        datetime: new Date(),
      })
      .expect(200)
  }),
  it('should be able to visualize one registered meal', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Café da manhã',
        description: 'Descrição de teste',
        diet: true,
        datetime: new Date(),
      }).expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!!)

    const mealId = listMealsResponse.body.meals[0].id

    const mealReturned = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies!!)

    expect(mealReturned.body.meal).toEqual(
      expect.objectContaining({
        name: 'Café da manhã'
      })
    )
  }),
  it('should be able to visualize metrics', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Café da manhã',
        description: 'Descrição de teste',
        diet: true,
        datetime: new Date('2026-06-16T08:00:00'),
      }).expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Salmão com salada',
        description: 'Descrição do almoço',
        diet: true,
        datetime: new Date('2026-06-16T12:00:00'),
      }).expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Cookies',
        description: 'Descrição do lanche da tarde',
        diet: false,
        datetime: new Date('2026-06-16T15:30:00'),
      }).expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Hambúrguer',
        description: 'Descrição do jantar',
        diet: false,
        datetime: new Date('2026-06-16T20:00:00'),
      }).expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies!!)

    expect(listMealsResponse.body.TotalMeals).toHaveLength(4)
    expect(listMealsResponse.body.TotalMealsInDiet).toEqual(2)
    expect(listMealsResponse.body.TotalMealsOffDiet).toEqual(2)
    expect(listMealsResponse.body.BestSequence).toEqual(2)

  }),
  it('should be able to delete a meal', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Vinícius',
        email: 'vinibrunheroto@gmail.com'
      }).expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!!)
      .send({
        name: 'Café da manhã',
        description: 'Descrição de teste',
        diet: true,
        datetime: new Date(),
      }).expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!!)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies!!)
      .expect(204)

  })
})