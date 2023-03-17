import * as jobs from '../jobs'
import * as services from '../services'
import { type BaseHandler, RoBoostClient, eventHandlers } from '../client'
import { Container, type interfaces } from 'inversify'
import { bloxy, constants } from '../utils'
import type { BaseJob } from '../jobs'
import { Client as BloxyClient } from '@guidojw/bloxy'

const { TYPES } = constants

const container = new Container()
const bind = container.bind.bind(container)

// Client
bind<RoBoostClient>(TYPES.RoBoostClient).to(RoBoostClient)
  .inSingletonScope()
bind<BloxyClient>(TYPES.BloxyClient).toDynamicValue(() => new BloxyClient({ rest: { requester: bloxy.requester } }))
  .inSingletonScope()

// Event Handlers
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildMemberUpdateEventHandler)
  .whenTargetTagged('eventHandler', 'guildMemberUpdate')

bind<interfaces.SimpleFactory<BaseHandler, [string]>>(TYPES.EventHandlerFactory)
  .toFactory<BaseHandler, [string]>(
  (context: interfaces.Context) => {
    return (eventName: string) => {
      return context.container.getTagged<BaseHandler>(TYPES.Handler, 'eventHandler', eventName)
    }
  }
)

// Jobs
bind<BaseJob>(TYPES.Job).to(jobs.HealthCheckJob)
  .whenTargetNamed('healthCheck')
bind<BaseJob>(TYPES.Job).to(jobs.UpdatePlaytestersJob)
  .whenTargetNamed('updatePlaytesters')

bind<interfaces.AutoNamedFactory<BaseJob>>(TYPES.JobFactory)
  .toAutoNamedFactory<BaseJob>(TYPES.Job)

// Services
bind<services.PlaytesterService>(TYPES.PlaytesterService).to(services.PlaytesterService)

export default container
