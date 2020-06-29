// https://github.com/FormidableLabs/jest-next-dynamic

const mockInitializers: any = [];

export default function preloadAll(): Promise<any> {
  if (mockInitializers.length) {
    // Copy and empty out `mockInitializers` right away so that any newly
    // enqueued components are found in the next pass.
    const initializers = mockInitializers.slice();
    mockInitializers.length = 0;
    // While loading the components in this round of initializers, more
    // components may have been dynamically imported, adding more initializers
    // we should run and await.
    return Promise.all(initializers.map((preload: any) => preload())).then(
      preloadAll
    );
  } else {
    return Promise.resolve();
  }
}

function createFactory(moduleName: string) {
  return () => {
    const dynamicModule = jest.requireActual(moduleName);
    const dynamic = dynamicModule.default;

    const mockDynamic = (loader: any, options: any) => {
      // Remove webpack-specific functionality added by the next/babel preset.
      if (loader && typeof loader === "object" && loader.loadableGenerated) {
        const { loadableGenerated, ...mockLoader } = loader;
        loader = mockLoader;
      }
      if (options && typeof options === "object" && options.loadableGenerated) {
        const { loadableGenerated, ...mockOptions } = options;
        options = mockOptions;
      }
      const LoadableComponent = dynamic(loader, options);
      mockInitializers.push(() =>
        LoadableComponent.preload
          ? LoadableComponent.preload()
          : LoadableComponent.render.preload()
      );
      return LoadableComponent;
    };

    // Replace the `default` export on the existing module so that other exports
    // and non-enumerable properties remain.
    dynamicModule.default = mockDynamic;
    return dynamicModule;
  };
}

// In order to more easily include this feature in shared Jest setups (like
// presets), use `virtual: true` to avoid throwing an error when `next` isn't
// actually installed or it's a version without `next-server` (introduced in
// Next.js 8).
for (const moduleName of ["next/dynamic", "next-server/dynamic"]) {
  jest.doMock(moduleName, createFactory(moduleName), { virtual: true });
}
