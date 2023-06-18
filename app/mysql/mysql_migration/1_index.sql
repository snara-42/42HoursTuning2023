-- ALTER TABLE `user`
-- ADD INDEX `idx_employee_id` ( `employee_id`),
-- ADD INDEX `idx_office_id` (`office_id`),
-- ADD INDEX `idx_user_icon_id` (`user_icon_id`),
-- ADD INDEX `idx_mail_password` (`mail`, `password`),
-- ADD INDEX `idx_user_entry_kana` (`entry_date`, `kana`);

-- ADD INDEX `idx_file_id` (`file_id`),

-- ALTER TABLE `session`
-- ADD INDEX `idx_session_id` (`session_id`),
-- ADD INDEX `idx_linked_user_id` (`linked_user_id`);
-- 
-- ALTER TABLE `department_role_member`
-- ADD INDEX `idx_user_id` (`user_id`);
-- 
-- ALTER TABLE `skill_member`
-- ADD INDEX `idx_user_id` (`user_id`);
-- 
-- ALTER TABLE `match_group`
-- ADD INDEX `idx_created_by` (`created_by`);
-- 
-- ALTER TABLE `match_group_member`
-- ADD INDEX `idx_user_id` (`user_id`),
-- ADD INDEX `idx_match_group_id` (`match_group_id`);

-- ALTER TABLE `office`
-- ADD INDEX `idx_office_id` (office_id);

-- ALTER TABLE `file`
-- ADD INDEX `idx_file_id` (file_id);

-- ALTER TABLE `skill`
-- ADD INDEX `idx_skill_name` (`skill_name`);


CREATE INDEX idx_mail_password ON `user` ( `mail`, `password` );
CREATE INDEX idx_entry_date_kana ON `user` ( `entry_date`, `kana`);

CREATE INDEX idx_linked_user_id ON `session` (`linked_user_id`);

CREATE INDEX idx_user_id_match_group_id ON `match_group_member` (`user_id`, `match_group_id`);
CREATE INDEX idx_match_group_id ON `match_group_member` (`match_group_id`);

CREATE INDEX idx_user_id ON `department_role_member` (`user_id`);
CREATE INDEX idx_role_id ON `department_role_member` (`role_id`);

ALTER TABLE `user` ADD FULLTEXT INDEX idx_ngram_user_name (`user_name`) WITH PARSER ngram;
ALTER TABLE `user` ADD FULLTEXT INDEX idx_ngram_kana (`kana`) WITH PARSER ngram;
ALTER TABLE `user` ADD FULLTEXT INDEX idx_ngram_mail (`mail`) WITH PARSER ngram;
ALTER TABLE `user` ADD FULLTEXT INDEX idx_ngram_goal (`goal`) WITH PARSER ngram;

ALTER TABLE `department` ADD FULLTEXT INDEX idx_ngram_department_name (`department_name`) WITH PARSER ngram;

ALTER TABLE `role` ADD FULLTEXT INDEX idx_ngram_role_name (`role_name`) WITH PARSER ngram;

ALTER TABLE `office` ADD FULLTEXT INDEX idx_ngram_office_name (`office_name`) WITH PARSER ngram;

