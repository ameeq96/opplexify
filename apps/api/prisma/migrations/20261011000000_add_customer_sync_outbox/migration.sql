ALTER TABLE `StreamingOrder`
    ADD COLUMN `iptvOrderId` INTEGER NULL,
    ADD COLUMN `iptvCustomerId` INTEGER NULL,
    ADD INDEX `StreamingOrder_iptv_customer_order_idx` (`iptvCustomerId`, `iptvOrderId`);

CREATE TABLE `CustomerSyncOutbox` (
    `sequence` BIGINT NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(64) NOT NULL,
    `eventType` VARCHAR(64) NOT NULL,
    `entityType` VARCHAR(32) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `data` JSON NOT NULL,
    `status` VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `claimToken` VARCHAR(36) NULL,
    `leaseExpiresAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `lastErrorCode` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `CustomerSyncOutbox_eventId_key` (`eventId`),
    INDEX `CustomerSyncOutbox_delivery_idx` (`status`, `nextAttemptAt`),
    INDEX `CustomerSyncOutbox_entity_idx` (`entityType`, `entityId`, `sequence`),
    PRIMARY KEY (`sequence`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
