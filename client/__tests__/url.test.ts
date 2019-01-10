import { createURL, POST_ENDPOINT } from "../utils//urls";

describe("urls", () => {
  it("updates a url", () => {
    const url = createURL(POST_ENDPOINT, "localhost:5000");

    expect(url).toContain("http");
    expect(url).not.toContain("//api");
  });
});
