import { getModelForClass, prop } from '@typegoose/typegoose';

export class ParsedFeesCollectedEvent {
  @prop({ type: String }) public token!: string;
  @prop({ type: String }) public integrator!: string;
  @prop({ type: String }) public integratorFee!: string;
  @prop({ type: String }) public lifiFee!: string;
}

export const getFeesCollectedEventModel = (chainName: string) => {
  const collName = `${chainName.toLowerCase()}_fees_collected`;
  return getModelForClass(ParsedFeesCollectedEvent, {
    options: { customName: collName },
    schemaOptions: {
      collection: collName,
      timestamps: true,
    },
  });
};

export type FeesCollectedEventModel = ReturnType<
  typeof getFeesCollectedEventModel
>;
