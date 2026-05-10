-- CreateTable
CREATE TABLE `PortfolioItem` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NULL,
    `mediaUrl` VARCHAR(191) NOT NULL,
    `mediaType` VARCHAR(191) NOT NULL DEFAULT 'image',
    `alt` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PortfolioItem_mediaUrl_key`(`mediaUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `PortfolioItem_public_sort_idx` ON `PortfolioItem`(`status`, `deletedAt`, `featured`, `sortOrder`);
