exports.up = function(knex) {
    return knex.schema.createTable('recovery_tokens', function(table) {
      table.string('user', 255).notNullable();
      table.string('email', 255).notNullable();
      table.string('token', 255).notNullable().primary();
      table.dateTime('dateTime').notNullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('recovery_tokens');
  };
  