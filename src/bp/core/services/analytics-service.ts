import { MetricName } from 'botpress/sdk'
import { AnalyticsRepository } from 'core/repositories/analytics-repository'
import { TYPES } from 'core/types'
import { inject, injectable } from 'inversify'
import moment from 'moment'

@injectable()
export default class AnalyticsService {
  constructor(@inject(TYPES.AnalyticsRepository) private analyticsRepo: AnalyticsRepository) {}

  async incrementMetric(botId: string, channel: string, metric: MetricName, increment = 1) {
    try {
      const analytics = await this.analyticsRepo.get({ botId, channel, metric })
      const latest = moment(analytics.created_on).startOf('day')
      const today = moment().startOf('day')

      // Aggregate metrics per day
      if (latest.isBefore(today)) {
        await this.analyticsRepo.insert({ botId, channel, metric, value: increment })
      } else {
        await this.analyticsRepo.update(analytics.id, analytics.value + increment)
      }
    } catch (err) {
      await this.analyticsRepo.insert({ botId, channel, metric, value: increment })
    }
  }

  async incrementMetricTotal(botId: string, channel: string, metric: MetricName, increment = 1) {
    try {
      const analytics = await this.analyticsRepo.get({ botId, channel, metric })
      const latest = moment(analytics.created_on).startOf('day')
      const today = moment().startOf('day')

      // Aggregate metrics per day
      if (latest.isBefore(today)) {
        await this.analyticsRepo.insert({ botId, channel, metric, value: analytics.value + increment })
      } else {
        await this.analyticsRepo.update(analytics.id, analytics.value + increment)
      }
    } catch (err) {
      await this.analyticsRepo.insert({ botId, channel, metric, value: increment })
    }
  }

  async getDateRange(botId: string, startDate: Date, endDate: Date, channel?: string) {
    return this.analyticsRepo.getBetweenDates(botId, startDate, endDate, channel)
  }
}
