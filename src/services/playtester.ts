import { type DistributivePick, constants } from '../utils'
import { inject, injectable } from 'inversify'
import { Client as BloxyClient } from '@guidojw/bloxy'

const { TYPES } = constants

type APIGetUniversePermissionsResult = Array<{
  action: 'Play' | 'Edit' | null
  allowedPermissions: '' | 'Play' | 'Play,Edit'
} & ({
  userId: `${number}`
  userName: string
} | {
  groupId: `${number}`
  groupName: string
} | {
  rolesetId: `${number}`
  rolesetName: string
  groupId: `${number}`
  rank: `${number}`
  groupName: string
})>
type APIGetUniversePermissionsResultEntry = APIGetUniversePermissionsResult[number]

interface APIPostUniversePermissions {
  subjectType: 'User' | 'Group' | 'Roleset'
  subjectId: string
  action: 'Play' | 'Edit'
}
type APIDeleteUniversePermissions = APIPostUniversePermissions

export type Playtester = {
  action: 'Play' | 'Edit' | null
  allowedPermissions: '' | 'Play' | 'Play,Edit'
} & ({
  userId: number
  userName: string
} | {
  groupId: number
  groupName: string
} | {
  rolesetId: number
  rolesetName: string
  groupId: number
  rank: number
  groupName: string
})

@injectable()
export default class PlaytesterService {
  @inject(TYPES.BloxyClient)
  private readonly bloxyClient!: BloxyClient

  public async getPlaytesters (universeId: number): Promise<Playtester[]> {
    return (await this.bloxyClient.apis.developAPI.request({
      requiresAuth: true,
      request: {
        path: `v2/universes/${universeId}/permissions`,
        method: 'GET',
        responseOptions: {
          allowedStatusCodes: [200]
        }
      },
      json: true
    })).body.data.map((collaborator: APIGetUniversePermissionsResultEntry) => {
      let result: Partial<Playtester> = {
        action: collaborator.action,
        allowedPermissions: collaborator.allowedPermissions
      }
      if ('userId' in collaborator) {
        result = {
          ...result,
          userId: parseInt(collaborator.userId),
          userName: collaborator.userName
        }
      } else if (!('rolesetId' in collaborator)) {
        result = {
          ...result,
          groupId: parseInt(collaborator.groupId),
          groupName: collaborator.groupName
        }
      } else {
        result = {
          ...result,
          rolesetId: parseInt(collaborator.rolesetId),
          rolesetName: collaborator.rolesetName,
          groupId: parseInt(collaborator.groupId),
          rank: parseInt(collaborator.rank),
          groupName: collaborator.groupName
        }
      }
      return result
    })
  }

  public async addPlaytesters (
    universeId: number,
    playtesters: Array<DistributivePick<Playtester, 'userId' | 'groupId' | 'rolesetId'>>
  ): Promise<void> {
    await this.bloxyClient.apis.developAPI.request({
      requiresAuth: true,
      request: {
        path: `v2/universes/${universeId}/permissions`,
        method: 'POST',
        json: playtesters.map(playtester => {
          let result: Partial<APIPostUniversePermissions> = {
            action: 'Play'
          }
          if ('userId' in playtester) {
            result = {
              ...result,
              subjectType: 'User',
              subjectId: String(playtester.userId)
            }
          } else if (!('rolesetId' in playtester)) {
            result = {
              ...result,
              subjectType: 'Group',
              subjectId: String(playtester.groupId)
            }
          } else {
            result = {
              ...result,
              subjectType: 'Roleset',
              subjectId: String(playtester.rolesetId)
            }
          }
          return result
        }),
        responseOptions: {
          allowedStatusCodes: [200]
        }
      },
      json: true
    })
  }

  public async removePlaytesters (
    universeId: number,
    playtesters: Array<DistributivePick<Playtester, 'userId' | 'groupId' | 'rolesetId'>>
  ): Promise<void> {
    await this.bloxyClient.apis.developAPI.request({
      requiresAuth: true,
      request: {
        path: `v2/universes/${universeId}/permissions`,
        method: 'DELETE',
        json: playtesters.map(playtester => {
          let result: Partial<APIDeleteUniversePermissions> = {
            action: 'Play'
          }
          if ('userId' in playtester) {
            result = {
              ...result,
              subjectType: 'User',
              subjectId: String(playtester.userId)
            }
          } else if (!('rolesetId' in playtester)) {
            result = {
              ...result,
              subjectType: 'Group',
              subjectId: String(playtester.groupId)
            }
          } else {
            result = {
              ...result,
              subjectType: 'Roleset',
              subjectId: String(playtester.rolesetId)
            }
          }
          return result
        }),
        responseOptions: {
          allowedStatusCodes: [200]
        }
      },
      json: true
    })
  }
}
