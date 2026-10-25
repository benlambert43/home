import {
  CHIP_CLASSES,
  NAME_TEXT_CLASSES,
  PLAIN_CHIP_CLASSES,
  RESULTS_GRID_CLASSES,
  ROW_CLASSES,
  ROW_HEADER_CLASSES,
  WORD_LIST_CLASSES,
} from "@/app/projects/software/namegenerator/styles";

export type SampleName = { text: string; parts: readonly string[] };

const SampleNames = ({ names }: { names: readonly SampleName[] }) => (
  <ul aria-label="Sample names" className={RESULTS_GRID_CLASSES}>
    {names.map(({ text, parts }) => (
      <li
        key={text}
        className={`${ROW_CLASSES} flex flex-col ring-slate-700/80`}
      >
        <div className={ROW_HEADER_CLASSES}>
          <code className={NAME_TEXT_CLASSES}>{text}</code>
        </div>
        <ul aria-label={`Words in ${text}`} className={WORD_LIST_CLASSES}>
          {parts.map((word) => (
            <li key={word} className={`${CHIP_CLASSES} ${PLAIN_CHIP_CLASSES}`}>
              {word}
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
);

export default SampleNames;
