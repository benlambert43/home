import { Fragment } from "react";

const SEPARATOR = /[^a-z0-9]/i;

const nameSegments = (text: string, parts: readonly string[]) => {
  const segments: string[] = [];
  let start = 0;
  for (const part of parts) {
    let end = Math.min(start + part.length, text.length);
    while (end < text.length && SEPARATOR.test(text.charAt(end))) end += 1;
    segments.push(text.slice(start, end));
    start = end;
  }
  segments.push(text.slice(start));
  return segments.filter((segment) => segment !== "");
};

const NameText = ({
  text,
  parts,
}: {
  text: string;
  parts: readonly string[];
}) =>
  nameSegments(text, parts).map((segment, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {segment}
    </Fragment>
  ));

export default NameText;
