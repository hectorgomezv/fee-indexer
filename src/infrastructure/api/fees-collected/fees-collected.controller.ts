import type { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import { FeesCollectedApiMapper } from '@infrastructure/api/fees-collected/mappers/fees-collected.api.mapper.js';
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

export class EVMIndexerController {
  public readonly router: Router;

  constructor(private service: EVMIndexerService) {
    this.router = Router();
    this.router.get(
      '/fees-collected/:integrator',
      this.getFeesCollected.bind(this),
    );
  }

  // Improvement note:
  // Support for pagination (page + pageSize) could be added and propagated
  // through the service and repository layers down to the DB query (skip + limit).
  async getFeesCollected(req: Request, res: Response, next: NextFunction) {
    try {
      const { integrator } = req.params;
      const events =
        await this.service.getFeesCollectedByIntegrator(integrator);
      res.json({
        count: events.length,
        data: events.map((event) =>
          FeesCollectedApiMapper.toApiResponse(event),
        ),
      });
    } catch (err) {
      next(err);
    }
  }
}
