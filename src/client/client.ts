import { Client, type ClientEvents, Constants, Intents, type PartialTypes as PartialType } from 'discord.js'
import { decorate, inject, injectable, type interfaces } from 'inversify'
import { type BaseHandler } from '.'
import { constants } from '../utils'

const { PartialTypes } = Constants
const { TYPES } = constants

const REQUIRED_INTENTS: number[] = [
  Intents.FLAGS.GUILD_MEMBERS
]
const REQUIRED_PARTIALS: PartialType[] = [
  PartialTypes.GUILD_MEMBER
]

decorate(injectable(), Client)

@injectable()
export default class RoBoostClient<Ready extends boolean = boolean> extends Client<Ready> {
  @inject(TYPES.EventHandlerFactory)
  private readonly eventHandlerFactory!: interfaces.AutoNamedFactory<BaseHandler>

  public constructor () {
    super({ intents: REQUIRED_INTENTS, partials: REQUIRED_PARTIALS })

    this.once('ready', this.ready.bind(this))
  }

  private async ready (): Promise<void> {
    this.bindEvent('guildMemberUpdate')

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  private bindEvent (eventName: keyof ClientEvents): void {
    const handler = this.eventHandlerFactory(eventName)
    this.on(eventName, handler.handle.bind(handler))
  }
}
