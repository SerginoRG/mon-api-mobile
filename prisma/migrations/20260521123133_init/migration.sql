-- CreateTable
CREATE TABLE "Visiteur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "nbrjours" INTEGER NOT NULL,
    "tarifjournalier" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Visiteur_pkey" PRIMARY KEY ("id")
);
