import { setStoredUsername, userApiClient } from '@/api/client';
import type {
  ChangePasswordPayload,
  ChangeUserStatusPayload,
  CreateUserPayload,
  ModifyPermissionsPayload,
  ModifyUserPayload,
  User,
  UserPermissions,
  UserStatusResponse,
} from '@/types/api';

/**
 * Fetch list of all active/managed administrative users.
 */
export async function getUsersList(): Promise<User[]> {
  return userApiClient.get<User[], User[]>('/scm-user-api/scm-user-api/users');
}

/**
 * Fetch all registered usernames.
 */
export async function fetchUsernames(): Promise<string[]> {
  return userApiClient.get<string[], string[]>('/scm-user-api/scm-user-api/fetchusername');
}

/**
 * Register and create a new administrative or operations user with 18 permission flags.
 */
export async function createUser(payload: CreateUserPayload): Promise<{ message: string; userId: string; user?: User }> {
  return userApiClient.post<{ message: string; userId: string; user?: User }, { message: string; userId: string; user?: User }>(
    '/scm-user-api/scm-user-api/usercreation',
    payload
  );
}

/**
 * Fetch detailed profile of a user by username.
 */
export async function fetchUser(usernameOrId: string | number): Promise<User> {
  return userApiClient.get<User, User>(`/scm-user-api/scm-user-api/getUser/${encodeURIComponent(usernameOrId)}`);
}

/**
 * Fetch and verify user record matching both HRMS number and username.
 */
export async function getUserByHrmsAndUsername(
  hrmsId: string,
  username: string
): Promise<User> {
  return userApiClient.get<User, User>(
    `/scm-user-api/scm-user-api/getUserwithHrmsIdandUsername?hrmsId=${encodeURIComponent(hrmsId)}&username=${encodeURIComponent(username)}&guiUsername=${encodeURIComponent(username)}`
  );
}

/**
 * Modify an existing user's details, role, or circle assignments.
 */
export async function modifyUser(payload: ModifyUserPayload): Promise<{ message: string }> {
  return userApiClient.post<{ message: string }, { message: string }>(
    '/scm-user-api/scm-user-api/modifyUser',
    payload
  );
}

/**
 * Retrieve permissions and authorized modules for a specific username.
 */
export async function getUserPermissions(username: string, hrmsId: string = 'HRMS001'): Promise<UserPermissions> {
  return userApiClient.get<UserPermissions, UserPermissions>(
    `/scm-user-api/scm-user-api/getUserPermissionwithHrmsIdandUsername?hrmsId=${encodeURIComponent(hrmsId)}&username=${encodeURIComponent(username)}&guiUsername=${encodeURIComponent(username)}`
  );
}

/**
 * Modify role and fine-grained permissions for a user.
 */
export async function modifyPermissions(
  payload: ModifyPermissionsPayload
): Promise<{ message: string }> {
  return userApiClient.post<{ message: string }, { message: string }>(
    `/scm-user-api/scm-user-api/modifyPermissions?guiUser=${encodeURIComponent(payload.username)}`,
    payload.permissions
  );
}

/**
 * Check the active status, lockout state, and login session for a user.
 */
export async function userStatusCheck(username: string): Promise<UserStatusResponse> {
  return userApiClient.get<UserStatusResponse, UserStatusResponse>(
    `/scm-user-api/scm-user-api/userStatusCheck?username=${encodeURIComponent(username)}`
  );
}

/**
 * Change status of a user (1 for Active, 0 for Inactive).
 */
export async function changeUserStatus(
  payload: { username: string; hrmsId?: string; status: number }
): Promise<{ message: string; status: number }> {
  const currentOp = (typeof window !== 'undefined' && window.localStorage.getItem('scm_username')) || 'admin';
  return userApiClient.post<{ message: string; status: number }, { message: string; status: number }>(
    `/scm-user-api/scm-user-api/userStatusChangewithHrmsIdandUsername?hrmsId=${encodeURIComponent(payload.hrmsId || 'HRMS001')}&username=${encodeURIComponent(payload.username)}&guiUsername=${encodeURIComponent(currentOp)}&status=${payload.status}`
  );
}

/**
 * Change or reset password for the specified user.
 */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<{ message: string }> {
  return userApiClient.post<{ message: string }, { message: string }>(
    '/scm-user-api/scm-user-api/changePassword',
    payload
  );
}

/**
 * Invalidate user session and logout.
 */
export async function logout(username: string): Promise<{ message: string }> {
  setStoredUsername(null);
  return userApiClient.get<{ message: string }, { message: string }>(
    `/scm-user-api/scm-user-api/scmlogout?username=${encodeURIComponent(username)}`
  );
}

export const userApi = {
  getUsersList,
  fetchUsernames,
  createUser,
  fetchUser,
  getUserByHrmsAndUsername,
  modifyUser,
  getUserPermissions,
  modifyPermissions,
  userStatusCheck,
  changeUserStatus,
  changePassword,
  logout,
};
