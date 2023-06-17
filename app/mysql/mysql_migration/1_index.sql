-- add index

-- ALTER TABLE `?` ADD INDEX index_?(`?`);

ALTER TABLE `user` ADD INDEX index_user_id(`user_id`);
-- ALTER TABLE `user` ADD INDEX index_employee_id(`employee_id`);
-- ALTER TABLE `user` ADD INDEX index_user_name(`user_name`);
-- ALTER TABLE `user` ADD INDEX index_kana(`kana`);
-- ALTER TABLE `user` ADD INDEX index_entry_date(`entry_date`);

ALTER TABLE `session` ADD INDEX index_session_id(`session_id`);

ALTER TABLE `department` ADD INDEX index_department_id(`department_id`);

ALTER TABLE `role` ADD INDEX index_role_id(`role_id`);

ALTER TABLE `department_role_member` ADD INDEX index_department_id(`department_id`);

ALTER TABLE `office` ADD INDEX index_office_id(`office_id`);

ALTER TABLE `file` ADD INDEX index_file_id(`file_id`);

ALTER TABLE `skill` ADD INDEX index_skill_id(`skill_id`);

ALTER TABLE `skill_member` ADD INDEX index_skill_id(`skill_id`);
-- ALTER TABLE `skill_member` ADD INDEX index_user_id(`user_id`);

ALTER TABLE `match_group` ADD INDEX index_match_group_id(`match_group_id`);

ALTER TABLE `match_group_member` ADD INDEX index_match_group_id(`match_group_id`);
-- ALTER TABLE `match_group_member` ADD INDEX index_user_id(`user_id`);
