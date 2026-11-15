import type { Transport } from '../transport';
import type { DashboardStats } from '../types';

export function dashboardEndpoints<Options>(send: Transport<Options>) {
  return {
    stats: (options?: Options) =>
      send<DashboardStats>({ method: 'GET', path: '/api/dashboard/stats' }, options),
  };
}
