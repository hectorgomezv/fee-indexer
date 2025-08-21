import { getModelForClass, prop } from '@typegoose/typegoose';

class ParsedFeesCollectedEvent {
  @prop({ type: () => String }) public token!: string;
  @prop({ type: () => String }) public integrator!: string;
  @prop({ type: () => String }) public integratorFee!: string;
  @prop({ type: () => String }) public lifiFee!: string;
}

export const ParsedFeesCollectedEventModel = getModelForClass(
  ParsedFeesCollectedEvent,
  { schemaOptions: { collection: 'fees_collected', timestamps: true } },
);
