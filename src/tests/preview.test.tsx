import * as React from "react";
import "@testing-library/jest-dom";
import { render, wait } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { draftToMarkdown } from "markdown-draft-js";
import PreviewEntry from "../pages/preview/[id]";
import Content from "../components/content";
import { createMockPost } from "../utils/testing";
import { PreviewDocument } from "../utils/generated";

const previewMock: MockedResponse = {
  request: {
    query: PreviewDocument,
    variables: {
      id: "3efc9fe8-ab26-4316-9453-889fe444a2a1"
    }
  },
  result: {
    data: {
      preview: {
        title: "Hooks & TypeScript",
        dateAdded: "2019-04-14T07:40:08.591Z",
        id: "3efc9fe8-ab26-4316-9453-889fe444a2a1",
        content:
          '[Hooks](https://reactjs.org/docs/hooks-reference.html) are now a part of React starting in version [16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html). And I\'ve been rather _mehhh_ about them, then I started using them and got a little more _aight_ about them, and finally I started using Hooks with TypeScript and was like _well alright_. Now we have a different issue entirely.\n\n[This ](https://codesandbox.io/s/mo2m2qy038\n\n## Generics in TypeScript\n\nTypeScript has this concept of a "generic". When you\'re writing a function you may not know what parameter you\'re getting, what interface it matches, or what type it is, so as we add type annotations, we can add this "generic" type and allow the consumer to be able to provide their own type for the parameter.\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\n\nIn this very contrived example, we add `<T>` before the function parentheses and then we have `T` as a type to use. Now we can declare, our parameter has a type of `T`. This will let us either let TypeScript infer the type and know or let us explicitly define what type our function should work with.\n\n```typescript\nconst id = identity<string>("user");\n```\n\nGenerics give us a way to be more explicit with our code without making assumptions. You can read more about Generics in TypeScript in their docs.\n\n## React Hooks with TypeScript\n\nFor the record, I gained all of the following from reading through React\'s [type definitions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts). The value of adding these type annotations to your code is that we won\'t be assuming a type of `any` and with confidence define the interface for our state and context in the same way we\'re used to with `React.Component`.\n\n### `useState()`\n\nThis hook allows you to work with simple state. Normally you\'d call it like this:\n\n```js\nfunction App() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <>\n      Count: {count}\n      <button onClick={() => setCount(0)}>Reset</button>\n      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>\n      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>\n    </>\n  );\n}\n```\n\nIf you want to add types, you can pass an explicit generic to `useState` versus an inferred one\n\n```typescript\nconst [count, setCount] = React.useState<number>(0);\n```\n\nThis will tell us that `count` is a number, and that `setCount()` should expect a number.\n\n### `useContext()`\n\nThis hook makes working with the Context API more explicit IMO than using a `<Context.Consumer />` component.\n\n```js\nconst DarkModeContext = React.createContext({});\n\nfunction App() {\n  return (\n    <DarkModeContext.Provider value={{ darkMode: false }}>\n      <SomeComponent />\n    </DarkModeContext.Provider>\n  );\n}\n\nfunction SomeComponent() {\n  const { darkMode } = React.useContext(DarkModeContext);\n\n  return (\n    <div style={{ background: darkMode ? "black" : "white" }}>\n      Hello Darkness My Old Friend\n    </div>\n  );\n}\n```\n\nWorking in TypeScript will let us give `createContext` and `useContext` a generic to define the interface for our context. When we call `context` now, TypeScript knows with confidence that it has a key called `darkMode` and that it\'s not an implicit any.\n\n```tsx\ninterface IDarkModeContext {\n  darkMode: boolean;\n}\n\nconst DarkMode = React.createContext<IDarkModeContext>({ darkMode: false });\n\nfunction App() {\n  return (\n    <DarkModeContext.Provider value={{ darkMode: false }}>\n      <SomeComponent />\n    </DarkModeContext.Provider>\n  );\n}\n\nfunction SomeComponent() {\n  const context = React.useContext<IDarkModeContext>(DarkModeContext);\n\n  return (\n    <div style={{ background: context.darkMode ? "black" : "white" }}>\n      Hello Darkness My Old Friend\n    </div>\n  );\n}\n```\n\n### `useEffect()` & `useLayoutEffect()`\n\nNeither `useEffect()` or `useLayoutEffect()` take a generic because they don\'t return a value to use. But it does take two parameters, `EffectCallBack` and the `DependencyList`. 8\n\n```typescript\ntype EffectCallback = () => void | (() => void | undefined);\ntype DependencyList = ReadonlyArray<any>;\n\nfunction useEffect(effect: EffectCallback, deps?: DependencyList): void;\n```\n\n### `useReducer()`\n\n```js\nconst initialState = { count: 0 };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case "increment":\n      return { count: state.count + 1 };\n    case "decrement":\n      return { count: state.count - 1 };\n    default:\n      throw new Error();\n  }\n}\n\nfunction Counter({ initialState }) {\n  const [state, dispatch] = useReducer(reducer, initialState);\n  return (\n    <>\n      Count: {state.count}\n      <button onClick={() => dispatch({ type: "increment" })}>+</button>\n      <button onClick={() => dispatch({ type: "decrement" })}>-</button>\n    </>\n  );\n}\n```\n\n```typescript\ninterface IState {\n  count: number;\n}\n\ninterface IAction {\n  type: string;\n}\n\nconst initialState = { count: 0 };\n\nfunction reducer(state: IState, action: IAction): IState {\n  switch (action.type) {\n    case "increment":\n      return { count: state.count + 1 };\n    case "decrement":\n      return { count: state.count - 1 };\n    default:\n      throw new Error();\n  }\n}\n\nfunction Counter({ initialState }) {\n  const [state, dispatch] = React.useReducer<React.Reducer<IState, IAction>>(\n    reducer,\n    initialState\n  );\n  return (\n    <>\n      Count: {state.count}\n      <button onClick={() => dispatch({ type: "increment" })}>+</button>\n      <button onClick={() => dispatch({ type: "decrement" })}>-</button>\n    </>\n  );\n}\n```\n\n### `useMemo()`\n\n### `useRef()`\n\n### `useCallback()`\n\n### `useImperativeHandle()`\n\n### `useDebugValue()`\n\nThat\'s all I got, enjoy using Hooks with TypeScript! 🐠🎣🤯💸👋',
        author: {
          username: "charliewilco"
        }
      }
    }
  }
};

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/preview",
      query: "",
      asPath: ""
    };
  }
}));
describe("<Preview />", () => {
  it("loads server content", async () => {
    // const pathname = "/preview/3efc9fe8-ab26-4316-9453-889fe444a2a1";
    const { getByTestId, container } = render(
      <MockedProvider mocks={[previewMock]} addTypename={false}>
        <PreviewEntry
          id="3efc9fe8-ab26-4316-9453-889fe444a2a1"
          initialApolloState={{}}
        />
      </MockedProvider>
    );
    await wait(() => getByTestId("PREVIEW_ENTRTY_TITLE"));
    expect(container).toBeTruthy();
    expect(getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      "Hooks & TypeScript"
    );
    expect(getByTestId("PREVIEW_ENTRTY_BODY")).toBeInTheDocument();
  });

  it("takes static content", () => {
    const title = "Starting Again";
    const mockPost = createMockPost({ title, public: true });
    const content = draftToMarkdown(mockPost.content as Draft.RawDraftContentState);

    const { getByTestId } = render(
      <Content title={title} dateAdded={mockPost.dateAdded} content={content} />
    );
    expect(getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(title);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
