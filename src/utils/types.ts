export type DistributiveKeys<T> = T extends unknown ? keyof T : never

export type DistributivePick<T, K extends DistributiveKeys<T>> =
  T extends unknown
    ? keyof Pick_<T, K> extends never
      ? never
      : { [P in keyof Pick_<T, K>]: Pick_<T, K>[P] }
    : never

type Pick_<T, K> = Pick<T, Extract<keyof T, K>>
