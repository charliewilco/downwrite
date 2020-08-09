import handler from "../src";
import micro from "micro";

describe("Serverless implemenation", () => {
  it("exists", async () => {
    const server = micro(handler);

    expect(server).not.toBeFalsy();
  });
});
