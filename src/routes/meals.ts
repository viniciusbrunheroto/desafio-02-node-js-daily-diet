import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.js'
import { knex } from '../database.js'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', 
    {
      preHandler: [checkSessionIdExists]
    }, async (req,res) =>{

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        datetime: z.coerce.date(),
        diet: z.boolean()
      })
      
      const {name, description, datetime, diet} = createMealBodySchema.parse(req.body)
    
      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        datetime: datetime.getTime(),
        diet,
        user_id: req.user?.id,
      })

      return res.status(201).send()
    }),

  app.put('/:id', 
    {
      preHandler: [checkSessionIdExists]
    },
    async (req,res) => {

      const getMealParamsSchema = z.object({
        id: z.uuid(),
      })

      const { id } = getMealParamsSchema.parse(req.params)

      const getMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        datetime: z.coerce.date(),
        diet: z.boolean()
      })

      const { name, description, datetime, diet } = getMealBodySchema.parse(req.body)


      const meal = await knex('meals')
        .where({
          id,
        })
        .first()


      if (!meal) {
        return res.status(404).send({error: 'Meal not found'})
      }

      await knex('meals').where({
        id,
      }).update({
        name,
        description,
        diet,
        datetime: datetime.getTime()
      })

      return res.status(204).send()
    }),

  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async( req, res) => {


    const meals = await knex('meals')
      .select('*')
      .where('user_id', req.user?.id)

    return {meals}

  }),

  app.get('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (req, res) => {

    const getMealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)

    const meal = await knex('meals')
      .where({
        id,
      })
      .first()

    if (!meal) {
      return res.status(404).send({error: 'Meal not found'})
    }

    return {meal}

  }),

  app.delete('/:id', {
    preHandler: [checkSessionIdExists]
  }, async(req,res) => {


    const getMealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)

    const meal = await knex('meals').where({
      id,
    }).first()

    if (!meal) {
      return res.status(404).send({error: 'Meal not found'})
    }

    await knex('meals')
      .where({
        id
      })
      .delete()
      
    return res.status(204).send()
      
  }),
  
  app.get('/metrics', {
    preHandler: [checkSessionIdExists]
  } , async(req, res) => {

    const totalMeals = await knex('meals')
      .where('user_id', req.user?.id)
      .orderBy('datetime', 'desc')

    const totalMealsInDiet = await knex('meals')
      .where({
        user_id: req.user?.id,
        diet: true,
      })
      .count('id', {as: 'total'})
      .first()

    const totalMealsOffDiet = await knex('meals')
      .where({
        user_id: req.user?.id,
        diet: false,
      })
      .count('id', {as: 'total'})
      .first()


    const {bestSequence} = totalMeals.reduce((acc, meal) => {
      if (meal.diet) {
        acc.currentSequence += 1
      } else {
        acc.currentSequence = 0
      }

      if (acc.currentSequence > acc.bestSequence) {
        acc.bestSequence = acc.currentSequence
      }

      return acc
    },
    { bestSequence: 0, currentSequence: 0},
    )


    return res.send({
      TotalMeals: totalMeals,
      TotalMealsInDiet: totalMealsInDiet?.total,
      TotalMealsOffDiet: totalMealsOffDiet?.total,
      BestSequence: bestSequence

    })

  })

  
}