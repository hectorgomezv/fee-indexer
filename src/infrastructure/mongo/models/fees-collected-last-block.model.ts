import { getModelForClass, prop } from '@typegoose/typegoose';

class FeesCollectedLastBlock {
  @prop({ type: () => Number }) public lastBlock!: number;
}

export const FeesCollectedLastBlockModel = getModelForClass(
  FeesCollectedLastBlock,
  {
    schemaOptions: {
      collection: 'fees_collected_last_block',
      timestamps: true,
    },
  },
);
