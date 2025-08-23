export class ClientError extends Error {
  constructor(
    public status: number = 500,
    public code: string = 'CLIENT_ERROR',
    message: string = 'Provider error',
  ) {
    super(message);
    this.name = 'ClientError';
  }
}
