import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('snacks', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.dateTime('date').notNullable()
    table.boolean('isDiet').notNullable()
    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('users.id').onDelete('CASCADE')
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('snacks')
}
