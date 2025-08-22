import { getModelForClass, prop } from '@typegoose/typegoose';

export class FeesCollectedLastBlock {
  @prop({ type: () => Number }) public lastBlock!: number;
}

export const getFeesCollectedLastBlockModel = (chainName: string) => {
  const collName = `${chainName.toLowerCase()}_fees_collected_last_block`;
  return getModelForClass(FeesCollectedLastBlock, {
    options: { customName: collName },
    schemaOptions: {
      collection: collName,
      timestamps: true,
    },
  });
};

export type FeesCollectedLastBlockModel = ReturnType<
  typeof getFeesCollectedLastBlockModel
>;
