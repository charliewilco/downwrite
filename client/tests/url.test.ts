import { createURL } from "../utils/urls";
import { Endpoints } from "downwrite";

describe("urls", () => {
  it("updates a url", () => {
    expect(createURL(Endpoints.POST_ENDPOINT, "localhost:5000")).toContain("http");
    expect(createURL(Endpoints.POST_ENDPOINT, "localhost:5000")).not.toContain(
      "//api"
    );
    expect(
      createURL(Endpoints.POST_ENDPOINT, "downwrite-9ivohrqa3.now.sh")
    ).toContain("http");
    expect(
      createURL(Endpoints.POST_ENDPOINT, "downwrite-9ivohrqa3.now.sh")
    ).not.toContain("//api");
  });
});
