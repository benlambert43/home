import { CloseIcon } from "@/app/blog/aquariusEditor/AquariusIcons";

const TIPS: { syntax: string; meaning: string }[] = [
  { syntax: "**bold** _italic_ `code`", meaning: "Bold, italic, code" },
  { syntax: "# Heading", meaning: "Heading (## for a subheading)" },
  { syntax: "- item / 1. item", meaning: "Bullets / numbering" },
  { syntax: "> text", meaning: "Quote" },
  { syntax: "[text](https://…)", meaning: "Link" },
  { syntax: "| a | b |", meaning: "Table" },
  { syntax: "---", meaning: "Horizontal line" },
  { syntax: "\\ at the end of a line", meaning: "Line break" },
];

const AquariusHelp = ({ onClose }: { onClose: () => void }) => (
  <div
    role="dialog"
    aria-label="Help"
    className="fixed right-4 bottom-4 z-20 w-80 max-w-[calc(100vw-2rem)] border
      border-(--win-dark) bg-(--win-light) p-3 text-black
      shadow-[2px_2px_0_0_var(--win-dark)]"
  >
    <div className="flex items-center justify-between gap-2">
      <p className="font-bold">Markdown Help</p>
      <button
        type="button"
        aria-label="Hide Markdown Help"
        onClick={onClose}
        className="flex size-4 items-center justify-center
          hover:shadow-(--bevel-thin-raised) focus:outline-none
          focus-visible:shadow-(--bevel-thin-raised)"
      >
        <CloseIcon />
      </button>
    </div>

    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
      {TIPS.map(({ syntax, meaning }) => (
        <div key={syntax} className="contents">
          <dt>
            <code className="font-mono text-[10px]">{syntax}</code>
          </dt>
          <dd className="text-(--win-shadow)">{meaning}</dd>
        </div>
      ))}
    </dl>

    <p className="mt-2 text-(--win-shadow)">
      Images come from Insert › Image or the Images list below.
    </p>
  </div>
);

export default AquariusHelp;
