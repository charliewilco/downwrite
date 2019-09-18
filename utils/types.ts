export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Many<T> = T | T[];

// tslint:disable-next-line: interface-name
export interface StringTMap<T> {
  [key: string]: T;
}
