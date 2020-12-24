import { sanitize } from "@utils/sanitize";

describe("Clean and retain object", () => {
  const myObject = {
    a: "a",
    b: "b",
    c: "c",
    d: "d"
  };

  const cloned = sanitize(myObject, ["c"]);

  it("does not contain key and value", () => {
    expect(cloned).not.toHaveProperty("c");
  });

  it("does not mutate original object", () => {
    expect(myObject).toHaveProperty("c");
  });
});
