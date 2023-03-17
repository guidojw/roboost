export interface CronConfig { name: string, expression: string }

const cronConfig: Record<string, CronConfig> = {
  healthCheckJob: {
    name: 'healthCheck',
    expression: '*/5 * * * *' // https://crontab.guru/#*/5_*_*_*_*
  }
}

export default cronConfig
