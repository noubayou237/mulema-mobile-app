-- Fix: add ON DELETE CASCADE to UserMulemThemeProgress.userId FK
-- This table was created via prisma db push without cascade, blocking user deletion.

ALTER TABLE "UserMulemThemeProgress"
  DROP CONSTRAINT IF EXISTS "UserMulemThemeProgress_userId_fkey";

ALTER TABLE "UserMulemThemeProgress"
  ADD CONSTRAINT "UserMulemThemeProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
