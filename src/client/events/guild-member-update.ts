import type { BaseHandler } from '..'
import type { GuildMember } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
export default class GuildMemberUpdateEventHandler implements BaseHandler {
  public async handle (oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (oldMember.premiumSince === null && newMember.premiumSince !== null) {

    } else if (oldMember.premiumSince !== null && newMember.premiumSince === null) {

    }
  }
}
