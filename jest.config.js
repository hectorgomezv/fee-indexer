import { createDefaultPreset } from 'ts-jest';

export default {
  testEnvironment: 'node',
  transform: {
    ...createDefaultPreset().transform,
  },
};
