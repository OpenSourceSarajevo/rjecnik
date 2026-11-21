import type { Transport } from '../transport';
import type { Activity, ActivityParams, DashboardStats } from '../types';

export function dashboardEndpoints<Options>(send: Transport<Options>) {
  return {
    stats: (options?: Options) =>
      send<DashboardStats>({ method: 'GET', path: '/api/dashboard/stats' }, options),

    /** Words created and edited in a date range; the last 24 hours by default. */
    activity: (params: ActivityParams = {}, options?: Options) =>
      send<Activity>({ method: 'GET', path: '/api/dashboard/activity', query: params }, options),
  };
}
