export function storageMock() {
  let storage: Record<string, string> = {};

  return {
    setItem(key: string, value: any) {
      storage[key] = value || "";
    },
    getItem(key: string) {
      return key in storage ? storage[key] : null;
    },
    removeItem(key: string) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key(i: number) {
      const keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
}

if (!(global as any).localStorage) {
  (global as any).localStorage = storageMock();
}
