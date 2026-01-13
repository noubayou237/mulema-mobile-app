import bcrypt from 'bcrypt';

const result = await bcrypt.compare(
  'password123',
  '$2b$10$TUpo9OfirIj3Lm34n4uJCeelKBxmnEFS9NxE7nbsTnjwX/1fJ021m'
);

console.log(result);