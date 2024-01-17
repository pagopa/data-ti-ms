export type NotInKeys<T, K extends string> = K extends keyof T ? never : K;
