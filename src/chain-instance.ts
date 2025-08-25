import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { EVMIndexerController } from '@infrastructure/api/fees-collected/fees-collected.controller.js';
import { EthersEVMClient } from '@infrastructure/evm/ethers-evm-client.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { getFeesCollectedLastBlockModel } from '@infrastructure/mongo/models/fees-collected-last-block.model.js';
import { getFeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';
import { MongoEventsRepository } from '@infrastructure/mongo/mongo-events.repository.js';
import type { Application } from 'express';

export class ChainInstance {
  private scheduler: EVMScheduler;
  private httpController: EVMIndexerController;

  /**
   * Creates a chain-specific application container instance.
   * Each chain is associated with an instance of the EVMIndexerService, EVMScheduler, EVMIndexerController, etc.
   * @param chainConfig The configuration for the EVM chain.
   * @param httpServer The common HTTP server instance.
   */
  constructor(
    private chainConfig: ChainConfig,
    private httpServer: Application,
  ) {
    const { chainName } = chainConfig;
    const feesCollectedLastBlockModel =
      getFeesCollectedLastBlockModel(chainName);
    const feesCollectedEventModel = getFeesCollectedEventModel(chainName);
    const repository = new MongoEventsRepository(
      feesCollectedLastBlockModel,
      feesCollectedEventModel,
    );
    const client = new EthersEVMClient(chainConfig);
    const service = new EVMIndexerService(chainConfig, client, repository);
    this.scheduler = new EVMScheduler(service, chainConfig);
    this.httpController = new EVMIndexerController(service);
  }

  /**
   * Starts the chain instance and adds its chain-specific HTTP routes.
   */
  async start(): Promise<void> {
    this.httpServer.use(
      `/api/${this.chainConfig.chainId}`,
      this.httpController.router,
    );
    await this.scheduler.start();
  }
}
