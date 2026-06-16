import type { Knex } from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary(),
    table.string('name').notNullable(),
    table.string('description').notNullable(),
    table.date('datetime').notNullable(),
    table.boolean('diet').notNullable(),
    table.uuid('user_id').references('users.id').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

