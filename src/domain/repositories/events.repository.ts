import type { ParsedFeeCollectorEvent } from '../entities/parsed-fee-collector-event.entity.js';

export interface EventsRepository {
  storeFeeCollectorEvent(event: ParsedFeeCollectorEvent): Promise<void>;
  findFeeCollectorEventByIntegrator(
    integrator: ParsedFeeCollectorEvent['integrator'],
  ): Promise<ParsedFeeCollectorEvent[]>;
}
