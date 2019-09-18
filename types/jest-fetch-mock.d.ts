import "jest";

declare module "jest-mock-fetch" {
  export interface FetchMock extends jest.MockInstance<any> {
    (input?: string | Request, init?: RequestInit): Promise<Response>;

    mockResponse(body: BodyOrFunction, init?: MockParams): FetchMock;
    mockResponseOnce(body: BodyOrFunction, init?: MockParams): FetchMock;
    once(body: BodyOrFunction, init?: MockParams): FetchMock;
    mockResponses(
      ...responses: Array<BodyOrFunction | [BodyOrFunction, MockParams]>
    ): FetchMock;
    mockReject(error?: ErrorOrFunction): FetchMock;
    mockRejectOnce(error?: ErrorOrFunction): FetchMock;
    resetMocks(): void;
  }

  // reference: https://github.github.io/fetch/#Response
  export interface MockParams {
    status?: number;
    statusText?: string;
    headers?: string[][] | { [key: string]: string }; // HeadersInit
    url?: string;
  }

  export interface MockResponseInit extends MockParams {
    body?: string;
  }

  export type BodyOrFunction = string | MockResponseInitFunction;
  export type ErrorOrFunction = Error | MockResponseInitFunction;

  export type MockResponseInitFunction = () => Promise<MockResponseInit>;
}
