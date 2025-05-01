-- CreateTable
CREATE TABLE "game" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "platforms" TEXT[],
    "imageUrl" TEXT NOT NULL,
    "rating" JSONB NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);
