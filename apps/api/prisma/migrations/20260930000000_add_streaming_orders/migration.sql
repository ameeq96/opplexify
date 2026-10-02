-- CreateTable
CREATE TABLE `StreamingOrder` (
    `id` VARCHAR(191) NOT NULL,
    `publicToken` VARCHAR(191) NOT NULL,
    `checkoutKey` VARCHAR(191) NOT NULL,
    `sourcePackageId` INTEGER NOT NULL,
    `packageType` VARCHAR(191) NOT NULL,
    `providerName` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `durationLabel` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `amountMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `status` ENUM('PENDING', 'CHECKOUT_STARTED', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `safepayTracker` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StreamingOrder_publicToken_key`(`publicToken`),
    UNIQUE INDEX `StreamingOrder_checkoutKey_key`(`checkoutKey`),
    UNIQUE INDEX `StreamingOrder_safepayTracker_key`(`safepayTracker`),
    INDEX `StreamingOrder_status_created_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafepayWebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventKey` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SafepayWebhookEvent_eventKey_key`(`eventKey`),
    INDEX `SafepayWebhookEvent_processed_created_idx`(`processedAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
