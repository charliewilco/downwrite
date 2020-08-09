import { URLEndpoints } from "../utils/urls";
import { Endpoints } from "../utils/api";

describe("urls", () => {
  it("updates a url", () => {
    expect(URLEndpoints.create(Endpoints.POST_ENDPOINT, "localhost:5000")).toContain(
      "http"
    );
    expect(
      URLEndpoints.create(Endpoints.POST_ENDPOINT, "localhost:5000")
    ).not.toContain("//api");
    expect(
      URLEndpoints.create(Endpoints.POST_ENDPOINT, "downwrite-9ivohrqa3.now.sh")
    ).toContain("http");
    expect(
      URLEndpoints.create(Endpoints.POST_ENDPOINT, "downwrite-9ivohrqa3.now.sh")
    ).not.toContain("//api");
  });
});
