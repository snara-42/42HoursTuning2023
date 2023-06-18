import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { SearchedUser, User, UserForFilter } from "../../model/types";
import {
  convertToSearchedUser,
  convertToUserForFilter,
  convertToUsers,
} from "../../model/utils";

export const getUserIdByMailAndPassword = async (
  mail: string,
  hashPassword: string
): Promise<string | undefined> => {
  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT u.user_id FROM user u WHERE u.mail = ? AND u.password = ?",
    [mail, hashPassword]
  );
  if (user.length === 0) {
    return;
  }

  return user[0].user_id;
};

export const getUsers = async (
  limit: number,
  offset: number
): Promise<User[]> => {
  // const query = `SELECT user_id, user_name, office_id, user_icon_id FROM user ORDER BY entry_date ASC, kana ASC LIMIT ? OFFSET ?`;
  // const rows: RowDataPacket[] = [];

  // const [userRows] = await pool.query<RowDataPacket[]>(query, [limit, offset]);
  // for (const userRow of userRows) {
  //   const [officeRows] = await pool.query<RowDataPacket[]>(
  //     `SELECT office_name FROM office WHERE office_id = ?`,
  //     [userRow.office_id]
  //   );
  //   const [fileRows] = await pool.query<RowDataPacket[]>(
  //     `SELECT file_name FROM file WHERE file_id = ?`,
  //     [userRow.user_icon_id]
  //   );
  //   userRow.office_name = officeRows[0].office_name;
  //   userRow.file_name = fileRows[0].file_name;
  //   rows.push(userRow);
  // }

  // return convertToUsers(rows);
  const query = `SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name 
  FROM user 
  LEFT JOIN office ON user.office_id = office.office_id 
  LEFT JOIN file ON user.user_icon_id = file.file_id 
  ORDER BY user.entry_date ASC, user.kana ASC 
  LIMIT ? OFFSET ?`;

  const [rows] = await pool.query<RowDataPacket[]>(query, [limit, offset]);

  return convertToUsers(rows);
};

export const getUserByUserId = async (
  userId: string
): Promise<User | undefined> => {
  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT u.user_id, u.user_name, u.office_id, u.user_icon_id FROM user u WHERE u.user_id = ?",
    [userId]
  );
  if (user.length === 0) {
    return;
  }

  const [office] = await pool.query<RowDataPacket[]>(
    `SELECT o.office_name FROM office o WHERE o.office_id = ?`,
    [user[0].office_id]
  );
  const [file] = await pool.query<RowDataPacket[]>(
    `SELECT f.file_name FROM file f WHERE f.file_id = ?`,
    [user[0].user_icon_id]
  );

  return {
    userId: user[0].user_id,
    userName: user[0].user_name,
    userIcon: {
      fileId: user[0].user_icon_id,
      fileName: file[0].file_name,
    },
    officeName: office[0].office_name,
  };
};

export const getUsersByUserIds = async (
  userIds: string[]
): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  for (const userId of userIds) {
    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT u.user_id, u.user_name, u.kana, u.entry_date, u.office_id, u.user_icon_id FROM user u WHERE u.user_id = ?",
      [userId]
    );
    if (userRows.length === 0) {
      continue;
    }

    const [officeRows] = await pool.query<RowDataPacket[]>(
      `SELECT o.office_name FROM office o WHERE o.office_id = ?`,
      [userRows[0].office_id]
    );
    const [fileRows] = await pool.query<RowDataPacket[]>(
      `SELECT f.file_name FROM file f WHERE f.file_id = ?`,
      [userRows[0].user_icon_id]
    );
    userRows[0].office_name = officeRows[0].office_name;
    userRows[0].file_name = fileRows[0].file_name;

    users = users.concat(convertToSearchedUser(userRows));
  }
  return users;
};

export const getUsersByUserName = async (
  userName: string
): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.user_id FROM user u WHERE u.user_name LIKE ?`,
    [`%${userName}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByKana = async (kana: string): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.user_id FROM user u WHERE u.kana LIKE ?`,
    [`%${kana}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByMail = async (mail: string): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.user_id FROM user u WHERE u.mail LIKE ?`,
    [`%${mail}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByDepartmentName = async (
  departmentName: string
): Promise<SearchedUser[]> => {
  const [departmentIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT d.department_id FROM department d WHERE d.department_name LIKE ? AND d.active = true`,
    [`%${departmentName}%`]
  );
  const departmentIds: string[] = departmentIdRows.map(
    (row) => row.department_id
  );
  if (departmentIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT d.user_id FROM department_role_member d WHERE d.department_id IN (?) AND d.belong = true`,
    [departmentIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByRoleName = async (
  roleName: string
): Promise<SearchedUser[]> => {
  const [roleIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT r.role_id FROM role r WHERE r.role_name LIKE ? AND r.active = true`,
    [`%${roleName}%`]
  );
  const roleIds: string[] = roleIdRows.map((row) => row.role_id);
  if (roleIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT d.user_id FROM department_role_member d WHERE d.role_id IN (?) AND d.belong = true`,
    [roleIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByOfficeName = async (
  officeName: string
): Promise<SearchedUser[]> => {
  const [officeIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT o.office_id FROM office o WHERE o.office_name LIKE ?`,
    [`%${officeName}%`]
  );
  const officeIds: string[] = officeIdRows.map((row) => row.office_id);
  if (officeIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT u.user_id FROM user u WHERE u.office_id IN (?)`,
    [officeIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersBySkillName = async (
  skillName: string
): Promise<SearchedUser[]> => {
  const [skillIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.skill_id FROM skill s WHERE s.skill_name LIKE ?`,
    [`%${skillName}%`]
  );
  const skillIds: string[] = skillIdRows.map((row) => row.skill_id);
  if (skillIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.user_id FROM skill_member s WHERE s.skill_id IN (?)`,
    [skillIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByGoal = async (goal: string): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.user_id FROM user u WHERE u.goal LIKE ?`,
    [`%${goal}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUserForFilter = async (
  userId?: string
): Promise<UserForFilter> => {
  let userRows: RowDataPacket[];
  if (!userId) {
    [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT u.user_id, u.user_name, u.office_id, u.user_icon_id FROM user u ORDER BY RAND() LIMIT 1"
    );
  } else {
    [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT u.user_id, u.user_name, u.office_id, u.user_icon_id FROM user u WHERE u.user_id = ?",
      [userId]
    );
  }
  const user = userRows[0];

  const [officeNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT o.office_name FROM office o WHERE o.office_id = ?`,
    [user.office_id]
  );
  const [fileNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT f.file_name FROM file f WHERE f.file_id = ?`,
    [user.user_icon_id]
  );
  const [departmentNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT d.department_name FROM department d WHERE d.department_id = (SELECT dm.department_id FROM department_role_member dm WHERE dm.user_id = ? AND belong = true)`,
    [user.user_id]
  );
  const [skillNameRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.skill_name FROM skill s WHERE s.skill_id IN (SELECT sm.skill_id FROM skill_member sm WHERE sm.user_id = ?)`,
    [user.user_id]
  );

  user.office_name = officeNameRow[0].office_name;
  user.file_name = fileNameRow[0].file_name;
  user.department_name = departmentNameRow[0].department_name;
  user.skill_names = skillNameRows.map((row) => row.skill_name);

  return convertToUserForFilter(user);
};
