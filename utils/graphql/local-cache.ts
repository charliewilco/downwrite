export class LocalCache<T> {
  private _items: T[];

  get items() {
    return this._items;
  }

  public add(item: T) {
    this._items.push(item);
  }

  public remove(item: T) {}
}
