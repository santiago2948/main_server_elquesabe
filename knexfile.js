require('dotenv').config();


module.exports = {
    development: {
      client: 'mysql',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: parseInt(process.env.PORT),
        password: process.env.DB_PASS,
        database: process.env.DATABASE,
        
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    }
  };
  