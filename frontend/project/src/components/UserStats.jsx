import { useUserStats } from '../hooks/useUserStats'
import PropTypes from 'prop-types'

const UserStats = ({ userId }) => {
  const { data: stats, isLoading, error } = useUserStats(userId)

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">
          Usage Statistics
        </h3>
        <p className="text-red-400 text-sm">
          Failed to load stats: {error.message}
        </p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const dailyUsagePercent = (stats.presentations_today / stats.daily_limit) * 100

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">
        Usage Statistics
      </h3>
      
      <div className="space-y-4">
        {/* Daily Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Daily Usage</span>
            <span className="text-sm font-medium text-gray-200">
              {stats.presentations_today} / {stats.daily_limit}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                dailyUsagePercent >= 90 ? 'bg-red-500' :
                dailyUsagePercent >= 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Resets daily at midnight UTC
          </p>
        </div>

        {/* Rate Limiting Info */}
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>5 requests per minute limit</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{stats.remaining} presentations remaining today</span>
          </div>
        </div>

        {/* Warning for high usage */}
        {dailyUsagePercent >= 80 && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-400 text-xs font-medium">
                {dailyUsagePercent >= 100 ? 'Daily limit reached' : 'Approaching daily limit'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
UserStats.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

export default UserStats