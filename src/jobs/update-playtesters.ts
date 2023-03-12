import { inject, injectable } from 'inversify'
import type BaseJob from './base'
import { PlaytesterService } from '../services'
import { RoBoostClient } from '../client'
import { constants } from '../utils'

const { TYPES } = constants

const GUILD_ID = '248213310787289099'

const UNIVERSE_ID = 72547907

@injectable()
export default class UpdatePlaytestersJob implements BaseJob {
  @inject(TYPES.RoBoostClient)
  private readonly discordClient!: RoBoostClient<true>

  @inject(TYPES.PlaytesterService)
  private readonly playtesterService!: PlaytesterService

  public async run (): Promise<void> {
    const guild = this.discordClient.guilds.cache.get(GUILD_ID)
    if (typeof guild === 'undefined') {
      throw new Error('Guild not found.')
    }

    const premiumMembers = (await guild.members.fetch()).filter(member => member.premiumSince !== null)

    console.log(premiumMembers.map(premiumMembers => premiumMembers.nickname))

    console.log(await this.playtesterService.getPlaytesters(UNIVERSE_ID))

    await this.playtesterService.addPlaytesters(UNIVERSE_ID, [{ userId: 1 }])

    await this.playtesterService.removePlaytesters(UNIVERSE_ID, [{ userId: 1 }])
  }
}
