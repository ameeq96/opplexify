ALTER TABLE `Page`
  MODIFY `summary` TEXT NULL,
  MODIFY `seoDescription` TEXT NULL;

ALTER TABLE `Service`
  MODIFY `shortDescription` TEXT NULL,
  MODIFY `description` TEXT NULL,
  MODIFY `seoDescription` TEXT NULL;

ALTER TABLE `Project`
  MODIFY `shortDescription` TEXT NULL,
  MODIFY `description` TEXT NULL,
  MODIFY `seoDescription` TEXT NULL;

ALTER TABLE `BlogPost`
  MODIFY `excerpt` TEXT NULL,
  MODIFY `content` TEXT NULL,
  MODIFY `seoDescription` TEXT NULL;

ALTER TABLE `TeamMember`
  MODIFY `bio` TEXT NULL,
  MODIFY `seoDescription` TEXT NULL;

ALTER TABLE `Faq`
  MODIFY `answer` TEXT NOT NULL;

ALTER TABLE `Testimonial`
  MODIFY `reviewText` TEXT NOT NULL;

ALTER TABLE `ContactMessage`
  MODIFY `message` TEXT NOT NULL,
  MODIFY `adminNotes` TEXT NULL;
