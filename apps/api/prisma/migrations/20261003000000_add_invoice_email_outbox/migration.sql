CREATE TABLE `InvoiceEmailDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `recipient` VARCHAR(191) NULL,
    `invoiceData` JSON NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `claimToken` VARCHAR(36) NULL,
    `leaseExpiresAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `lastErrorCode` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `InvoiceEmailDelivery_orderId_key`(`orderId`),
    UNIQUE INDEX `InvoiceEmailDelivery_messageId_key`(`messageId`),
    INDEX `InvoiceEmailDelivery_status_next_idx`(`status`, `nextAttemptAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `InvoiceEmailDelivery_orderId_fkey` FOREIGN KEY (`orderId`)
        REFERENCES `StreamingOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
