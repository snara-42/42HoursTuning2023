ALTER TABLE `user`
ADD INDEX `idx_employee_id` (`employee_id`),
ADD INDEX `idx_office_id` (`office_id`),
ADD INDEX `idx_user_icon_id` (`user_icon_id`);
ADD INDEX `idx_mail_password` (`mail`, `password`)
ADD INDEX `idx_user_entry_kana` (`entry_data`, `kana`)
-- ADD INDEX `idx_office_id` (`user_id`),
-- ADD INDEX `idx_file_id` (`file_id`),

ALTER TABLE `session`
ADD INDEX `idx_linked_user_id` (`linked_user_id`);

ALTER TABLE `department_role_member`
ADD INDEX `idx_user_id` (`user_id`);

ALTER TABLE `skill_member`
ADD INDEX `idx_user_id` (`user_id`);

ALTER TABLE `match_group`
ADD INDEX `idx_created_by` (`created_by`);

---------------------------------------------------------
-- ALTER TABLE `office`
-- ADD INDEX `idx_office_id` (office_id);

-- ALTER TABLE `file`
-- ADD INDEX `idx_file_id` (file_id);

-- ALTER TABLE `skill`
-- ADD INDEX `idx_skill_name` (`skill_name`);

-- ALTER TABLE `match_group_member`
-- ADD INDEX `idx_user_id` (`user_id`);
-- ADD INDEX `idx_match_group_id` (`match_group_id`);
