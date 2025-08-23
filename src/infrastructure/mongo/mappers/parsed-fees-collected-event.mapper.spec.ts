import { ParsedFeesCollectedEventMapper } from '@infrastructure/mongo/mappers/parsed-fees-collected-event.mapper.js';
import type { ParsedFeesCollectedEvent } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';
import { buildEvent, randomAddress, randomInt } from '@tests/fixtures.js';
import { BigNumber } from 'ethers';
import { describe, expect, it } from 'vitest';

describe('ParsedFeesCollectedEventMapper', () => {
  it('toPersistence should convert BigNumber fields to strings', () => {
    const event = buildEvent();
    const result = ParsedFeesCollectedEventMapper.toPersistence(event);
    expect(result).toEqual({
      token: event.token,
      integrator: event.integrator,
      integratorFee: event.integratorFee.toString(),
      lifiFee: event.lifiFee.toString(),
    });
  });

  it('toDomain should convert string fields to BigNumber', () => {
    const doc: InstanceType<typeof ParsedFeesCollectedEvent> = {
      token: randomAddress(),
      integrator: randomAddress(),
      integratorFee: randomInt().toString(),
      lifiFee: randomInt().toString(),
    };
    const result = ParsedFeesCollectedEventMapper.toDomain(doc);
    expect(result).toEqual({
      token: doc.token,
      integrator: doc.integrator,
      integratorFee: BigNumber.from(doc.integratorFee),
      lifiFee: BigNumber.from(doc.lifiFee),
    });
  });
});
