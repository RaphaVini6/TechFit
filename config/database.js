const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL não definida. Copie o .env.example para .env e suba o banco com "npm run db:up".'
  );
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // Para bancos hospedados (Neon, Supabase...) defina DATABASE_SSL=true
  dialectOptions:
    process.env.DATABASE_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {}
});

module.exports = sequelize;
