import { createURL, POST_ENDPOINT } from "../utils/urls";

describe("urls", () => {
  it("updates a url", () => {
    expect(createURL(POST_ENDPOINT, "localhost:5000")).toContain("http");
    expect(createURL(POST_ENDPOINT, "localhost:5000")).not.toContain("//api");
    expect(createURL(POST_ENDPOINT, "downwrite-9ivohrqa3.now.sh")).toContain("http");
    expect(createURL(POST_ENDPOINT, "downwrite-9ivohrqa3.now.sh")).not.toContain(
      "//api"
    );
  });
});
