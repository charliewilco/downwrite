export function sanitize<T>(entity: object, values: string[]): Partial<T> {
  const newEntity: any = Object.assign({}, entity);
  values.forEach(
    (val: string): void => {
      delete newEntity[val];
    }
  );

  return newEntity;
}
