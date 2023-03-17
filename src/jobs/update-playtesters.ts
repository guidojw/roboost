import { type DistributivePick, constants, util } from '../utils'
import { type Playtester, PlaytesterService, universeService, userService, verificationService } from '../services'
import { inject, injectable } from 'inversify'
import type BaseJob from './base'
import type { GuildMember } from 'discord.js'
import { RoBoostClient } from '../client'

const { TYPES } = constants

@injectable()
export default class UpdatePlaytestersJob implements BaseJob {
  @inject(TYPES.RoBoostClient)
  private readonly discordClient!: RoBoostClient<true>

  @inject(TYPES.PlaytesterService)
  private readonly playtesterService!: PlaytesterService

  public async run (universeId: number, guildId: string, outputChannelId?: string): Promise<void> {
    const guild = this.discordClient.guilds.cache.get(guildId)
    if (typeof guild === 'undefined') {
      throw new Error('Guild not found.')
    }

    const premiumMembers = (await guild.members.fetch()).filter(member => member.premiumSince !== null)
    const playtesters = await this.playtesterService.getPlaytesters(universeId)

    const notVerifieds: GuildMember[] = []
    const premiumMembersRobloxIds: number[] = []
    const newPlaytesters: Array<DistributivePick<Playtester, 'userId' | 'userName'>> = []
    const oldPlaytesters: Array<DistributivePick<Playtester, 'userId' | 'userName'>> = []

    for (const premiumMember of premiumMembers.values()) {
      const verificationData = await verificationService.fetchVerificationData(premiumMember.id, guildId)
      if (verificationData === null) {
        notVerifieds.push(premiumMember)
        continue
      }

      premiumMembersRobloxIds.push(verificationData.robloxId)

      const robloxId = verificationData.robloxId
      if (await UpdatePlaytestersJob.shouldAdd(playtesters, robloxId)) {
        const userName = verificationData.robloxUsername ?? (await userService.getUser(verificationData.robloxId)).name
        newPlaytesters.push({ userId: robloxId, userName })
      }
    }

    for (const playtester of playtesters) {
      if (!('userId' in playtester)) {
        continue
      }

      if (UpdatePlaytestersJob.shouldRemove(premiumMembersRobloxIds, playtester)) {
        oldPlaytesters.push(playtester)
      }
    }

    if (oldPlaytesters.length > 0) {
      await this.playtesterService.removePlaytesters(universeId, oldPlaytesters)
    }
    if (newPlaytesters.length > 0) {
      await this.playtesterService.addPlaytesters(universeId, newPlaytesters)
    }

    if (typeof outputChannelId !== 'undefined') {
      const channel = await guild.channels.fetch(outputChannelId)
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (channel !== null && channel.isText()) {
        const outputMessage = await UpdatePlaytestersJob.getOutputMessage(
          universeId,
          notVerifieds,
          newPlaytesters,
          oldPlaytesters
        )
        if (outputMessage !== '') {
          await channel.send({ content: outputMessage, allowedMentions: { parse: [] } })
        }
      }
    }
  }

  private static async shouldAdd (playtesters: Playtester[], userId: number): Promise<boolean> {
    const groupsRoles = await userService.getGroupsRoles(userId)
    return !playtesters.some(playtester => {
      return 'userId' in playtester
        ? playtester.userId === userId
        : !('rolesetId' in playtester)
            ? typeof groupsRoles.find(group => group.group.id === playtester.groupId) !== 'undefined' &&
              playtester.action?.includes('Play')
            : groupsRoles.find(group => group.group.id === playtester.groupId)?.role.rank === playtester.rank &&
              playtester.action?.includes('Play')
    })
  }

  private static shouldRemove (
    premiumMembersRobloxIds: number[],
    playtester: Extract<Playtester, { userId: number }>
  ): boolean {
    const ignoreUsers = (process.env.IGNORE_USER_IDS ?? '').split(',').map(robloxId => parseInt(robloxId))
    return !ignoreUsers.includes(playtester.userId) && !premiumMembersRobloxIds.some(id => id === playtester.userId)
  }

  private static async getOutputMessage (
    universeId: number,
    notVerifieds: GuildMember[],
    newPlaytesters: Array<DistributivePick<Playtester, 'userName'>>,
    oldPlaytesters: Array<DistributivePick<Playtester, 'userName'>>
  ): Promise<string> {
    const universeName = (await universeService.getUniverse(universeId)).name
    let message = ''
    if (newPlaytesters.length > 0) {
      message += `Added ${util.makeCommaSeparatedString(newPlaytesters.map(playtester => playtester.userName).map(username => `**${username}**`))} to ${universeName}.\n`
    }
    if (oldPlaytesters.length > 0) {
      message += `Removed ${util.makeCommaSeparatedString(oldPlaytesters.map(playtester => playtester.userName).map(username => `**${username}**`))} from ${universeName}.\n`
    }
    if (notVerifieds.length > 0) {
      message += `Couldn't add ${util.makeCommaSeparatedString(notVerifieds.map(member => member.toString()))} to ${universeName}. Verify with RoVer or Bloxlink in order to be added.`
    }
    return message
  }
}
