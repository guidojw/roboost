import { inject, injectable, named } from 'inversify'
import type { BaseHandler } from '..'
import { BaseJob } from '../../jobs'
import type { GuildMember } from 'discord.js'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class GuildMemberUpdateEventHandler implements BaseHandler {
  @inject(TYPES.Job)
  @named('updatePlaytesters')
  private readonly updatePlaytestersJob!: BaseJob

  public async handle (oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (
      oldMember.premiumSince !== newMember.premiumSince ||
      (newMember.premiumSince !== null && oldMember.displayName !== newMember.displayName)
    ) {
      await this.updatePlaytestersJob.run(
        parseInt(process.env.UNIVERSE_ID as string),
        process.env.GUILD_ID,
        process.env.OUTPUT_CHANNEL_ID
      )
    }
  }
}
