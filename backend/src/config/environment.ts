import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mess_meal_db',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_mess_jwt_token_2026',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
