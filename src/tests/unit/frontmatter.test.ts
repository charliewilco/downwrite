import { fm } from "@utils/fm";

const fixture = `
---
title: Red Dead Redemption
---

Hello
`.trim();

describe("Front matter", () => {
  it("parses frontmatter", () => {
    const parsed = fm(fixture);

    expect(parsed.attributes.title).toBe("Red Dead Redemption");
  });

  it("preserves body", () => {
    const parsed = fm(fixture);

    expect(parsed.body).toContain("Hello");
  });
});
