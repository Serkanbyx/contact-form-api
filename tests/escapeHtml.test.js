const escapeHtml = require("../src/utils/escapeHtml");

describe("escapeHtml", () => {
  it("escapes all HTML-special characters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands and single quotes", () => {
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Hello world")).toBe("Hello world");
  });
});
