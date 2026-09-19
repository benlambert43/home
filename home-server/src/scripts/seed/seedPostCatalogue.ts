import { readFileSync } from "node:fs";
import path from "node:path";
import { SeedImage, SeedPalette } from "./seedPostImages";

const DUSK: SeedPalette = ["#312e81", "#f472b6"];

const DAWN: SeedPalette = ["#0369a1", "#fcd34d"];

const FOREST: SeedPalette = ["#064e3b", "#86efac"];

const EMBER: SeedPalette = ["#7c2d12", "#fdba74"];

const SLATE: SeedPalette = ["#0f172a", "#94a3b8"];

const VIOLET: SeedPalette = ["#581c87", "#c4b5fd"];

const PALETTES = [DUSK, DAWN, FOREST, EMBER, SLATE, VIOLET];

const ANIMATION_FRAMES = 8;

const LONG_READ_PARTS = 36;

const LONG_READ_PARAGRAPHS = [
  "The path climbs steadily from the car park, first through beech forest and then out onto open tussock, where the wind finds you for the first time. It is the kind of climb that rewards a slow start. Set a pace you could hold a conversation at, and keep it, because the ridge is further away than it looks from the bottom.",
  "By mid morning the cloud had lifted off the tops and the whole valley opened up below. The river showed as a single bright thread, doubling back on itself across the flats. There is a particular quiet above the bush line, made of wind and distance, and it is worth stopping just to stand in it for a minute.",
  "Lunch was eaten in the lee of a boulder the size of a small house. Someone long ago had stacked a low wall of stones against the weather side, and it still does its job. A thermos of tea, a sandwich that had been sat on, and a view that ran all the way to the coast: there are worse places to eat.",
  "The way down always takes longer than planned. Knees complain, the light goes flat, and the last hour through the trees is walked mostly from memory. But the car was where it had been left, the boots came off, and the day settled into the comfortable ache of having been well used.",
];

const LONG_TITLE =
  "A deliberately long title that keeps going well past the point of good taste, to show how the blog list, the post page, and the browser tab cope with an author who will not stop typing until the limit";

export interface SeedPostEdit {
  title?: string;
  content?: string;
  headerImage?: SeedImage | null;
  inlineImages?: SeedImage[];
  removeInlineImages?: string[];
}

export interface SeedPost {
  title: string;
  content: string;
  headerImage?: SeedImage;
  inlineImages?: SeedImage[];
  edits?: SeedPostEdit[];
}

const markdown = (name: string) =>
  readFileSync(path.join(__dirname, "posts", `${name}.md`), "utf8");

const picture = (
  name: string,
  width: number,
  height: number,
  colors: SeedPalette,
  extras: Partial<SeedImage> = {},
): SeedImage => ({ name, width, height, colors, ...extras });

const longRead = () =>
  Array.from({ length: LONG_READ_PARTS }, (_, part) =>
    [
      `## Part ${part + 1}`,
      LONG_READ_PARAGRAPHS[part % LONG_READ_PARAGRAPHS.length],
      LONG_READ_PARAGRAPHS[(part + 1) % LONG_READ_PARAGRAPHS.length],
    ].join("\n\n"),
  ).join("\n\n");

const SHOWCASE_POSTS: SeedPost[] = [
  {
    title: "A tour of everything a post can hold",
    content: markdown("everything"),
    headerImage: picture("ridge-at-dusk.jpg", 2400, 1350, DUSK),
    inlineImages: [
      picture("layout-diagram.png", 1600, 900, SLATE),
      picture("harbour.webp", 1400, 933, DAWN),
      picture("lichen.avif", 1200, 800, FOREST),
      picture("sun-loop.gif", 480, 300, EMBER, { frames: ANIMATION_FRAMES }),
    ],
  },
  {
    title: "Every image format in one post",
    content: markdown("image-formats"),
    headerImage: picture("formats-header.avif", 1600, 900, VIOLET),
    inlineImages: [
      picture("format.png", 240, 150, DUSK),
      picture("format.jpg", 240, 150, DAWN),
      picture("format.jpeg", 240, 150, FOREST),
      picture("format.webp", 240, 150, EMBER),
      picture("format.gif", 240, 150, SLATE),
      picture("format.avif", 240, 150, VIOLET),
    ],
  },
  {
    title: "Animated images",
    content: markdown("animated"),
    headerImage: picture("animated-header.gif", 640, 360, DAWN, {
      frames: ANIMATION_FRAMES,
    }),
    inlineImages: [
      picture("sunrise.gif", 480, 300, EMBER, { frames: ANIMATION_FRAMES }),
      picture("sunrise.webp", 480, 300, DUSK, { frames: ANIMATION_FRAMES }),
      picture("noon.png", 480, 300, DAWN),
    ],
  },
  {
    title: "Portraits, panoramas, squares, and a tiny icon",
    content: markdown("shapes-and-sizes"),
    headerImage: picture("panorama-header.jpg", 3200, 800, FOREST),
    inlineImages: [
      picture("portrait.jpg", 900, 1600, DUSK),
      picture("panorama.webp", 3200, 800, DAWN),
      picture("square.png", 1000, 1000, EMBER),
      picture("icon.png", 48, 48, VIOLET),
    ],
  },
  {
    title: "A phone photo that was stored sideways",
    content: markdown("sideways-photo"),
    headerImage: picture("sideways-header.jpg", 1200, 1600, EMBER, {
      sideways: true,
    }),
    inlineImages: [
      picture("stored-sideways.jpg", 900, 1200, DAWN, { sideways: true }),
    ],
  },
  {
    title: "Large photographs and their thumbnails",
    content: markdown("large-photo"),
    headerImage: picture("large-header.jpg", 3600, 2400, DUSK, {
      noisy: true,
    }),
    inlineImages: [
      picture("large-second.jpg", 3000, 2000, FOREST, { noisy: true }),
    ],
  },
  {
    title: "A header image and nothing else",
    content: markdown("header-only"),
    headerImage: picture("lone-header.webp", 1600, 900, SLATE),
  },
  {
    title: "Pictures in the text, but no header",
    content: markdown("inline-only"),
    inlineImages: [
      picture("first-idea.png", 1200, 800, VIOLET),
      picture("second-idea.jpg", 1200, 800, EMBER),
    ],
  },
  {
    title: "The header image, used again in the text",
    content: markdown("header-in-text"),
    headerImage: picture("valley.jpg", 1800, 1200, FOREST),
  },
  {
    title: "One image, used three times",
    content: markdown("repeated-image"),
    inlineImages: [
      picture("divider.png", 1600, 400, DAWN),
      picture("never-used.png", 800, 600, SLATE),
    ],
  },
  {
    title: "A Markdown reference, with no images",
    content: markdown("markdown-reference"),
  },
  {
    title: "Code blocks, long lines, and quoted markup",
    content: markdown("code"),
  },
  {
    title: "Ünïcödé, 日本語, العربية, and emoji 🏔️ in a title",
    content: markdown("unicode"),
    headerImage: picture("unicode-header.png", 1600, 900, VIOLET),
  },
  {
    title: LONG_TITLE,
    content:
      "The title above is exactly as long as a title may be. This text is short, so that nothing distracts from it.",
  },
  {
    title: "A long read",
    content: longRead(),
    headerImage: picture("long-read-header.jpg", 2000, 1125, DAWN),
  },
  {
    title: "Hi",
    content: "Hi.",
  },
  {
    title: "Edited: a new header image",
    content: markdown("replaced-header.first"),
    headerImage: picture("placeholder-header.jpg", 1600, 900, SLATE),
    edits: [
      {
        content: markdown("replaced-header.edited"),
        headerImage: picture("final-header.jpg", 1600, 900, FOREST),
      },
    ],
  },
  {
    title: "Edited: the header and a picture removed",
    content: markdown("trimmed.first"),
    headerImage: picture("removed-header.png", 1600, 900, EMBER),
    inlineImages: [
      picture("stays.webp", 1200, 800, FOREST),
      picture("goes.webp", 1200, 800, DUSK),
    ],
    edits: [
      {
        content: markdown("trimmed.edited"),
        headerImage: null,
        removeInlineImages: ["goes.webp"],
      },
    ],
  },
  {
    title: "Edited: a working title",
    content: markdown("renamed.first"),
    inlineImages: [picture("chart.png", 1400, 800, VIOLET)],
    edits: [
      {
        title: "Edited: renamed, then given a new chart",
        content: markdown("renamed.edited"),
      },
      { inlineImages: [picture("chart.png", 1400, 800, EMBER)] },
    ],
  },
];

const fieldNote = (number: number): SeedPost => {
  const colors = PALETTES[number % PALETTES.length];
  const sketch = `sketch-${number}.png`;
  const hasSketch = number % 3 === 0;

  return {
    title: `Field note ${number}`,
    content: [
      `Field note ${number} is filler: a short post that exists so the blog list runs to several pages, with a mix of posts that do and do not have pictures.`,
      ...(hasSketch
        ? [`![A sketch for note ${number}](./images/${sketch})`]
        : []),
    ].join("\n\n"),
    headerImage:
      number % 2 === 0
        ? picture(`field-note-${number}.webp`, 1600, 900, colors)
        : undefined,
    inlineImages: hasSketch ? [picture(sketch, 1000, 700, colors)] : [],
  };
};

export const seededTitle = ({ title, edits = [] }: SeedPost) =>
  edits.reduce((latest, edit) => edit.title ?? latest, title);

export const seedPostCatalogue = (count: number): SeedPost[] =>
  [
    ...SHOWCASE_POSTS,
    ...Array.from(
      { length: Math.max(0, count - SHOWCASE_POSTS.length) },
      (_, note) => fieldNote(note + 1),
    ),
  ].slice(0, count);
