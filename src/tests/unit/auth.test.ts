import { MockClient } from "@data/client";
import { DownwriteUIState } from "@data/store";
import { describe, it, expect } from "@jest/globals";

describe("Auth Module", () => {
  it("can load data", () => {
    const mockClient = new MockClient();
    const store = new DownwriteUIState(mockClient);
    const state = store.auth.state.getValue();
    expect(state.authed).toBeFalsy();
  });

  it("can check data", async () => {
    const mockClient = new MockClient();
    const store = new DownwriteUIState(mockClient);

    store.graphql.setToken("MOCK_TOKEN");
    await store.auth.check();

    const state = store.auth.state.getValue();

    expect(state.username).toEqual("david-yates");
    expect(state.id).toEqual("1");
  });
});
