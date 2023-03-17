export const TYPES = {
  // Client
  RoBoostClient: Symbol.for('RoBoostClient'),
  BloxyClient: Symbol.for('BloxyClient'),

  // Factories
  Handler: Symbol.for('Handler'),
  EventHandlerFactory: Symbol.for('EventHandlerFactory'),

  Job: Symbol.for('Job'),
  JobFactory: Symbol.for('JobFactory'),

  // Services
  PlaytesterService: Symbol.for('PlaytesterService')
}

export enum VerificationProvider {
  Bloxlink = 'bloxlink',
  RoVer = 'rover'
}
