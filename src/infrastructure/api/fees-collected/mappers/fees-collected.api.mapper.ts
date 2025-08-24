import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { FeesCollectedDTO } from '@infrastructure/api/fees-collected/entities/fees-collected.dto.entity.js';

export class FeesCollectedApiMapper {
  static toApiResponse(fee: ParsedFeesCollectedEvent): FeesCollectedDTO {
    return {
      token: fee.token,
      integrator: fee.integrator,
      integratorFee: fee.integratorFee.toString(),
      lifiFee: fee.lifiFee.toString(),
    };
  }
}
