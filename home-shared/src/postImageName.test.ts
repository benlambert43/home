import { describe, expect, it } from "vitest";

import { MAX_POST_IMAGE_NAME_CHARACTERS } from "./post";
import { toPostImageName, uniquePostImageName } from "./postImageName";
import { postImageNameSchema } from "./schemas";

const AWKWARD_FILE_NAMES = [
  "Photo of Café.JPG",
  "  ---  .png",
  "日本語.webp",
  "..hidden..thing..gif",
  `${"a".repeat(200)}.jpeg`,
  "́accent.avif",
  "%$#@!.png",
  ".png",
];

describe("toPostImageName", () => {
  it("keeps a name the schema already accepts", () => {
    expect(toPostImageName("diagram_2.png")).toBe("diagram_2.png");
  });

  it("lowercases the extension and strips diacritics from the stem", () => {
    expect(toPostImageName("Photo of Café.JPG")).toBe("Photo-of-Cafe.jpg");
  });

  it("falls back to a stem when nothing usable is left", () => {
    expect(toPostImageName("  ---  .png")).toBe("image.png");
  });

  it("refuses a file that is not a supported image", () => {
    expect(toPostImageName("notes.txt")).toBeUndefined();
    expect(toPostImageName("png")).toBeUndefined();
  });

  it("gives every awkward file name a name the upload schema accepts", () => {
    AWKWARD_FILE_NAMES.forEach((fileName) => {
      const parsed = postImageNameSchema.safeParse(toPostImageName(fileName));

      expect(parsed.success, `${fileName} became an unusable name`).toBe(true);
    });
  });
});

describe("uniquePostImageName", () => {
  it("keeps a name no other image has taken", () => {
    expect(uniquePostImageName("cover.png", ["diagram.png"])).toBe("cover.png");
  });

  it("adds a random suffix to a name that clashes whatever its letter case", () => {
    expect(uniquePostImageName("cover.png", ["COVER.PNG"])).toMatch(
      /^cover-[a-z0-9]{6}\.png$/,
    );
  });

  it("stays within the name limit when adding a suffix to a long name", () => {
    const longName = `${"a".repeat(MAX_POST_IMAGE_NAME_CHARACTERS - 4)}.png`;
    const suffixed = uniquePostImageName(longName, [longName]);

    expect(suffixed).not.toBe(longName);
    expect(postImageNameSchema.safeParse(suffixed).success).toBe(true);
  });
});
