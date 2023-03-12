import type { GetUserById } from '@guidojw/bloxy/dist/client/apis/UsersAPI'
import type { GetUserGroups } from '@guidojw/bloxy/dist/client/apis/GroupsAPI'
import { robloxAdapter } from '../adapters'

export type GetGroupsRoles = GetUserGroups['data']

export async function getGroupsRoles (userId: number): Promise<GetGroupsRoles> {
  return (await robloxAdapter('GET', 'groups', `v1/users/${userId}/groups/roles`)).data.data
}

export async function getUser (userId: number): Promise<GetUserById> {
  try {
    return (await robloxAdapter('GET', 'users', `v1/users/${userId}`)).data
  } catch (err) {
    throw new Error(`**${userId}** doesn't exist on Roblox.`)
  }
}
