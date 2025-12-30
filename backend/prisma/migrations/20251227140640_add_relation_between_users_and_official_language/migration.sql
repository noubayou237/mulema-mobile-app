-- AlterTable
ALTER TABLE "User" ADD COLUMN     "officialLanguageId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officialLanguageId_fkey" FOREIGN KEY ("officialLanguageId") REFERENCES "OfficialLanguage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
