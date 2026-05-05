-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
