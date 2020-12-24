import classNames from "@utils/classnames";

describe("Class Names", () => {
  it("Dedupes", () => {
    expect(classNames("Hello", "Hello")).toBe("Hello");
    expect(classNames("bg-white", true && "bg-white")).toBe("bg-white");
  });

  it("filters out nullish values", () => {
    expect(
      classNames(null, "bg-white", undefined, NaN, 0, 4, true, "text", false, "")
    ).toBe("bg-white text");
  });

  it("handles objects", () => {
    expect(
      classNames("bg-white", {
        text: true,
        nope: false,
        "py-3": "foo"
      })
    ).toBe("bg-white text py-3");
  });
});
