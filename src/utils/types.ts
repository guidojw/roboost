export type DistributiveKeys<T> = T extends unknown ? keyof T : never

export type DistributivePick<T, K extends DistributiveKeys<T>> = T extends unknown
  ? Pick<T, Extract<keyof T, K>>
  : never
