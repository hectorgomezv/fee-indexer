import { PolygonIndexerService } from '@application/services/polygon-indexer.service.js';
import { PolygonScheduler } from '@infrastructure/jobs/polygon.scheduler.js';

export function bootstrap() {
  const polygonIndexer = new PolygonIndexerService();
  const polygonScheduler = new PolygonScheduler(polygonIndexer);
  polygonScheduler.start();
  return { polygonScheduler };
}
