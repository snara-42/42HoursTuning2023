import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { MatchGroup, MatchGroupDetail, User } from "../../model/types";
import { getUsersByUserIds } from "../users/repository";
import { convertToMatchGroupDetail } from "../../model/utils";

export const hasSkillNameRecord = async (
  skillName: string
): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT s.skill_id, s.skill_name FROM skill s WHERE EXISTS (SELECT sk.skill_id, sk.skill_name FROM skill sk WHERE sk.skill_name = ?)",
    [skillName]
  );
  return rows.length > 0;
};

export const getUserIdsBeforeMatched = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT m.match_group_id FROM match_group_member m WHERE m.user_id = ?",
    [userId]
  );
  if (matchGroupIdRows.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT m.user_id FROM match_group_member m WHERE m.match_group_id IN (?)",
    [matchGroupIdRows]
  );

  return userIdRows.map((row) => row.user_id);
};

// export const insertMatchGroup = async (matchGroupDetail: MatchGroupDetail) => {
//   await pool.query<RowDataPacket[]>(
//     "INSERT INTO match_group (match_group_id, match_group_name, description, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
//     [
//       matchGroupDetail.matchGroupId,
//       matchGroupDetail.matchGroupName,
//       matchGroupDetail.description,
//       matchGroupDetail.status,
//       matchGroupDetail.createdBy,
//       matchGroupDetail.createdAt,
//     ]
//   );

//   for (const member of matchGroupDetail.members) {
//     await pool.query<RowDataPacket[]>(
//       "INSERT INTO match_group_member (match_group_id, user_id) VALUES (?, ?)",
//       [matchGroupDetail.matchGroupId, member.userId]
//     );
//   }
// };

export const insertMatchGroup = async (matchGroupDetail: MatchGroupDetail) => {
  await pool.query<RowDataPacket[]>(
    "INSERT INTO match_group (match_group_id, match_group_name, description, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      matchGroupDetail.matchGroupId,
      matchGroupDetail.matchGroupName,
      matchGroupDetail.description,
      matchGroupDetail.status,
      matchGroupDetail.createdBy,
      matchGroupDetail.createdAt,
    ]
  );

  const insertPromises = matchGroupDetail.members.map(member =>
    pool.query<RowDataPacket[]>(
      "INSERT INTO match_group_member (match_group_id, user_id) VALUES (?, ?)",
      [matchGroupDetail.matchGroupId, member.userId]
    )
  );

  await Promise.all(insertPromises);
};

export const getMatchGroupDetailByMatchGroupId = async (
  matchGroupId: string,
  status?: string
): Promise<MatchGroupDetail | undefined> => {
  let query =
    "SELECT m.match_group_id, m.match_group_name, m.description, m.status, m.created_by, m.created_at FROM match_group m WHERE m.match_group_id = ?";
  if (status === "open") {
    query += " AND status = 'open'";
  }
  const [matchGroup] = await pool.query<RowDataPacket[]>(query, [matchGroupId]);
  if (matchGroup.length === 0) {
    return;
  }

  const [matchGroupMemberIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT m.user_id FROM match_group_member m WHERE m.match_group_id = ?",
    [matchGroupId]
  );
  const matchGroupMemberIds: string[] = matchGroupMemberIdRows.map(
    (row) => row.user_id
  );

  const searchedUsers = await getUsersByUserIds(matchGroupMemberIds);
  // SearchedUserからUser型に変換
  const members: User[] = searchedUsers.map((searchedUser) => {
    const { kana: _kana, entryDate: _entryDate, ...rest } = searchedUser;
    return rest;
  });
  matchGroup[0].members = members;

  return convertToMatchGroupDetail(matchGroup[0]);
};

export const getMatchGroupIdsByUserId = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIds] = await pool.query<RowDataPacket[]>(
    "SELECT m.match_group_id FROM match_group_member m WHERE m.user_id = ?",
    [userId]
  );
  return matchGroupIds.map((row) => row.match_group_id);
};

export const getMatchGroupsByMatchGroupIds = async (
  matchGroupIds: string[],
  status: string
): Promise<MatchGroup[]> => {
  const promises = matchGroupIds.map(matchGroupId =>
    getMatchGroupDetailByMatchGroupId(matchGroupId, status)
  );
  const matchGroupDetails = await Promise.all(promises);
  
  const matchGroups: MatchGroup[] = matchGroupDetails
    .filter((matchGroupDetail): matchGroupDetail is MatchGroupDetail => matchGroupDetail !== undefined)
    .map(({ description, ...matchGroup }) => matchGroup);

  return matchGroups;
};

// export const getMatchGroupsByMatchGroupIds = async (
//   matchGroupIds: string[],
//   status: string
// ): Promise<MatchGroup[]> => {
//   let matchGroups: MatchGroup[] = [];
//   for (const matchGroupId of matchGroupIds) {
//     const matchGroupDetail = await getMatchGroupDetailByMatchGroupId(
//       matchGroupId,
//       status
//     );
//     if (matchGroupDetail) {
//       const { description: _description, ...matchGroup } = matchGroupDetail;
//       matchGroups = matchGroups.concat(matchGroup);
//     }
//   }

//   return matchGroups;
// };
