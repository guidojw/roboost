import * as Sentry from '@sentry/node'
import type { BaseJob } from '../jobs'
import type { Client as BloxyClient } from '@guidojw/bloxy'
import { RewriteFrames } from '@sentry/integrations'
import type { RoBoostClient } from '../client'
import { constants } from '../utils'
import container from '../configs/container'
import cron from 'node-cron'
import cronConfig from '../configs/cron'

const { TYPES } = constants

export async function init (): Promise<RoBoostClient> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH,
      integrations: [
        new RewriteFrames({
          root: process.cwd()
        })
      ]
    })
  }

  const jobFactory = container.get<(jobName: string) => BaseJob>(TYPES.JobFactory)
  const healthCheckJobConfig = cronConfig.healthCheckJob
  const healthCheckJob = jobFactory(healthCheckJobConfig.name)
  cron.schedule(
    healthCheckJobConfig.expression,
    () => {
      Promise.resolve(healthCheckJob.run('main')).catch(console.error)
    }
  )

  const discordClient = container.get<RoBoostClient>(TYPES.RoBoostClient)
  try {
    await discordClient.login(process.env.DISCORD_TOKEN)
  } catch (err) {
    console.error(err)
    discordClient.destroy()
    process.exit(1)
  }

  const bloxyClient = container.get<BloxyClient>(TYPES.BloxyClient)
  await bloxyClient.login(process.env.ROBLOX_COOKIE)

  await jobFactory('updatePlaytesters').run()

  return discordClient
}
