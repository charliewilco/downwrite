import "jest";

interface Config {
  name?: string;
  only?: boolean;
  skip?: boolean;
}

// Based on: https://github.com/atlassian/jest-in-case

export function cases<T extends Config>(
  title: string,
  tester: (opts: T, done?: () => void) => Promise<any>,
  testCases: T[]
): void {
  let normalized: T[];

  if (Array.isArray(testCases)) {
    normalized = testCases;
  } else {
    const safeRef = testCases;
    normalized = Object.keys(testCases).map(name => {
      return Object.assign({}, { name }, safeRef[name]);
    });
  }

  describe(title, () => {
    normalized.forEach((testCase, index) => {
      let name = testCase.name || `case: ${index + 1}`;

      let testFn;
      if (testCase.only) {
        testFn = test.only;
      } else if (testCase.skip) {
        testFn = test.skip;
      } else {
        testFn = test;
      }

      let cb;
      if (tester.length > 1) {
        cb = (done: any) => tester(testCase, done);
      } else {
        cb = () => tester(testCase);
      }

      testFn(name, cb);
    });
  });
}
