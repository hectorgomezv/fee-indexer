import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { ParsedFeesCollectedEvent as ParsedFeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';
import { BigNumber } from 'ethers';

// TODO: add tests

export class ParsedFeesCollectedEventMapper {
  static toPersistence(
    event: ParsedFeesCollectedEvent,
  ): ParsedFeesCollectedEventModel {
    return {
      token: event.token,
      integrator: event.integrator,
      integratorFee: event.integratorFee.toString(),
      lifiFee: event.lifiFee.toString(),
    };
  }

  static toDomain(
    doc: InstanceType<typeof ParsedFeesCollectedEventModel>,
  ): ParsedFeesCollectedEvent {
    return {
      token: doc.token,
      integrator: doc.integrator,
      integratorFee: BigNumber.from(doc.integratorFee),
      lifiFee: BigNumber.from(doc.lifiFee),
    };
  }
}
