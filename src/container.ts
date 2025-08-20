import { PolygonIndexerService } from '@application/services/polygon-indexer.service.js';
import { PolygonEVMClient } from '@infrastructure/evm/polygon-evm.client.js';
import { PolygonScheduler } from '@infrastructure/jobs/polygon.scheduler.js';

export function bootstrap() {
  const polygonClient = new PolygonEVMClient();
  const polygonIndexer = new PolygonIndexerService(polygonClient);
  const polygonScheduler = new PolygonScheduler(polygonIndexer);
  polygonScheduler.start();
  return { polygonScheduler };
}
