import { Target, SearchedUser } from "../../model/types";
import {
  getUsersByUserName,
  getUsersByKana,
  getUsersByMail,
  getUsersByDepartmentName,
  getUsersByRoleName,
  getUsersByOfficeName,
  getUsersBySkillName,
  getUsersByGoal,
} from "./repository";

export const getUsersByKeyword = async (
  keyword: string,
  targets: Target[]
): Promise<SearchedUser[]> => {

//  let users: SearchedUser[] = [];
//  for (const target of targets) {
//    const oldLen = users.length;
//    switch (target) {
//      case "userName":
//        users = users.concat(await getUsersByUserName(keyword));
//        break;
//      case "kana":
//        users = users.concat(await getUsersByKana(keyword));
//        break;
//      case "mail":
//        users = users.concat(await getUsersByMail(keyword));
//        break;
//      case "department":
//        users = users.concat(await getUsersByDepartmentName(keyword));
//        break;
//      case "role":
//        users = users.concat(await getUsersByRoleName(keyword));
//        break;
//      case "office":
//        users = users.concat(await getUsersByOfficeName(keyword));
//        break;
//      case "skill":
//        users = users.concat(await getUsersBySkillName(keyword));
//        break;
//      case "goal":
//        users = users.concat(await getUsersByGoal(keyword));
//        break;
//    }
//    console.log(`${users.length - oldLen} users found by ${target}`);
//  }

	const promises = targets.map((target) => {
		switch (target) {
			case "userName":
				return (getUsersByUserName(keyword));
			case "kana":
				return (getUsersByKana(keyword));
			case "mail":
				return (getUsersByMail(keyword));
			case "department":
				return (getUsersByDepartmentName(keyword));
			case "role":
				return (getUsersByRoleName(keyword));
			case "office":
				return (getUsersByOfficeName(keyword));
			case "skill":
				return (getUsersBySkillName(keyword));
			case "goal":
				return (getUsersByGoal(keyword));
			default:
				return Promise.resolve([]);
		}
	});
	const usersArray = await Promise.all(promises);
	const users: SearchedUser[] = [];
	users.concat(...usersArray);

	targets.forEach((target, i) => {
		console.log(`${usersArray[i].length} users found by ${target}`);
	});

	return users;
};
