import type { ParsedFeeCollectorEvent } from '@domain/entities/parsed-fee-collector-event.entity.js';

export interface EventsRepository {
  storeFeeCollectorEvent(event: ParsedFeeCollectorEvent): Promise<void>;
  findFeeCollectorEventByIntegrator(
    integrator: ParsedFeeCollectorEvent['integrator'],
  ): Promise<ParsedFeeCollectorEvent[]>;
}
