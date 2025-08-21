import { getModelForClass, prop } from '@typegoose/typegoose';

class ParsedFeesCollectedEventSchema {
  @prop() public token!: string;
  @prop() public integrator!: string;
  @prop() public integratorFee!: string;
  @prop() public lifiFee!: string;
}

export const ParsedFeesCollectedEventModel = getModelForClass(
  ParsedFeesCollectedEventSchema,
);
