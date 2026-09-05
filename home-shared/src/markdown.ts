const TAB_SIZE = 4;

const HARD_BREAK = "  ";

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;

const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;

const INLINE_CODE = /(`+)[\s\S]*?\1/g;

const RAW_HTML =
  /<\/?[A-Za-z][A-Za-z0-9-]*(?:[ \t\n][^<>]*)?\/?>|<!--|<!\[CDATA\[|<![A-Za-z]|<\?/;

const expandTabs = (line: string) => {
  let expanded = "";

  for (const character of line) {
    expanded +=
      character === "\t"
        ? " ".repeat(TAB_SIZE - (expanded.length % TAB_SIZE))
        : character;
  }

  return expanded;
};

const tidyLine = (line: string) => {
  const expanded = expandTabs(line);
  const trimmed = expanded.replace(/ +$/, "");

  return trimmed.length > 0 && expanded.length - trimmed.length >= 2
    ? `${trimmed}${HARD_BREAK}`
    : trimmed;
};

const openingFence = (line: string) => {
  const match = FENCE_OPEN.exec(line);
  if (!match) return undefined;

  return match[1].startsWith("`") && match[2].includes("`")
    ? undefined
    : match[1];
};

const closesFence = (line: string, fence: string) => {
  const match = FENCE_CLOSE.exec(line);

  return (
    match !== null &&
    match[1].startsWith(fence[0]) &&
    match[1].length >= fence.length
  );
};

export const normalizePostContent = (content: string) => {
  const lines = content.normalize("NFC").replace(/\r\n?/g, "\n").split("\n");

  const normalized: string[] = [];
  let fence: string | undefined;

  for (const line of lines) {
    if (fence !== undefined) {
      normalized.push(line);
      if (closesFence(line, fence)) fence = undefined;
      continue;
    }

    const tidied = tidyLine(line);

    if (tidied.length === 0) {
      if (normalized.length > 0 && normalized[normalized.length - 1] !== "") {
        normalized.push("");
      }
      continue;
    }

    fence = openingFence(tidied);
    normalized.push(tidied);
  }

  while (normalized[normalized.length - 1] === "") normalized.pop();

  if (fence === undefined) {
    const last = normalized.pop();
    if (last !== undefined) normalized.push(last.replace(/ +$/, ""));
  }

  return normalized.length === 0 ? "" : `${normalized.join("\n")}\n`;
};

export const containsRawHtml = (content: string) => {
  const prose: string[] = [];
  let fence: string | undefined;

  for (const line of content.split("\n")) {
    if (fence !== undefined) {
      if (closesFence(line, fence)) fence = undefined;
      continue;
    }

    fence = openingFence(line);
    if (fence === undefined) prose.push(line);
  }

  return RAW_HTML.test(prose.join("\n").replace(INLINE_CODE, ""));
};
