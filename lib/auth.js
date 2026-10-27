import { betterAuth } from 'better-auth';

let localDb = null;
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  const Database = require('better-sqlite3');
  localDb = new Database('better-auth-dev.sqlite');
}

export const createAuth = (db) => {
  return betterAuth({
    database: db || localDb,
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session after 1 day
    }
  });
};
