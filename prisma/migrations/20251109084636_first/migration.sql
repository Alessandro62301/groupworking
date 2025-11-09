-- CreateTable
CREATE TABLE `intentions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `company` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `notes` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `intentions_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invite_tokens` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `intention_id` INTEGER UNSIGNED NOT NULL,
    `token` CHAR(32) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invite_tokens_intention_id_key`(`intention_id`),
    UNIQUE INDEX `invite_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `company` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `members_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcements` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(180) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `author_admin_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `meeting_date` DATETIME(3) NOT NULL,
    `location` VARCHAR(160) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkins` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER UNSIGNED NOT NULL,
    `meeting_id` INTEGER UNSIGNED NOT NULL,
    `checked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `checkins_member_id_meeting_id_key`(`member_id`, `meeting_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referrals` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `from_member_id` INTEGER UNSIGNED NOT NULL,
    `to_member_id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('pending', 'in_progress', 'won', 'lost') NOT NULL DEFAULT 'pending',
    `value_cents` BIGINT UNSIGNED NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'BRL',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `one_on_ones` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `member_a_id` INTEGER UNSIGNED NOT NULL,
    `member_b_id` INTEGER UNSIGNED NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thanks` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `from_member_id` INTEGER UNSIGNED NOT NULL,
    `to_member_id` INTEGER UNSIGNED NOT NULL,
    `message` VARCHAR(191) NULL,
    `value_cents` BIGINT UNSIGNED NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'BRL',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dues` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER UNSIGNED NOT NULL,
    `reference_month` DATETIME(3) NOT NULL,
    `amount_cents` BIGINT UNSIGNED NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'BRL',
    `status` ENUM('open', 'paid', 'overdue') NOT NULL DEFAULT 'open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paid_at` DATETIME(3) NULL,

    UNIQUE INDEX `dues_member_id_reference_month_key`(`member_id`, `reference_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invite_tokens` ADD CONSTRAINT `invite_tokens_intention_id_fkey` FOREIGN KEY (`intention_id`) REFERENCES `intentions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_from_member_id_fkey` FOREIGN KEY (`from_member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_to_member_id_fkey` FOREIGN KEY (`to_member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `one_on_ones` ADD CONSTRAINT `one_on_ones_member_a_id_fkey` FOREIGN KEY (`member_a_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `one_on_ones` ADD CONSTRAINT `one_on_ones_member_b_id_fkey` FOREIGN KEY (`member_b_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thanks` ADD CONSTRAINT `thanks_from_member_id_fkey` FOREIGN KEY (`from_member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thanks` ADD CONSTRAINT `thanks_to_member_id_fkey` FOREIGN KEY (`to_member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dues` ADD CONSTRAINT `dues_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
