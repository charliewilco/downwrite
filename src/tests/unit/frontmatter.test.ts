import { fmParserr } from "src/shared/fm";

const fixture = `
---
title: Red Dead Redemption
---

Hello
`.trim();

describe("Front matter", () => {
  it("parses frontmatter", () => {
    const parsed = fmParserr(fixture);

    expect(parsed.attributes.title).toBe("Red Dead Redemption");
  });

  it("preserves body", () => {
    const parsed = fmParserr(fixture);

    expect(parsed.body).toContain("Hello");
  });
});
