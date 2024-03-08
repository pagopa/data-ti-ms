export type NotInKeys<T, K> = K extends keyof T ? never : K;
