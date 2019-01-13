interface StringTMap<T> {
  [key: string]: T;
}

function storageMock() {
  let storage: StringTMap<string> = {};

  return {
    setItem: function(key: string, value: any) {
      storage[key] = value || "";
    },
    getItem: function(key: string) {
      return key in storage ? storage[key] : null;
    },
    removeItem: function(key: string) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function(i: number) {
      var keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
}

if (!(global as any).localStorage) {
  (global as any).localStorage = storageMock();
}
