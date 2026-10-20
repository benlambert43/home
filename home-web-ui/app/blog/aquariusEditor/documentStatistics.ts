import { Node as DocumentNode } from "@tiptap/pm/model";

const isEmptyParagraph = (node: DocumentNode) =>
  node.type.name === "paragraph" && node.textContent.trim() === "";

export const documentStatistics = (doc: DocumentNode) => {
  const text = doc.textBetween(0, doc.content.size, "\n", " ");
  let paragraphs = 0;
  let lines = 0;

  doc.forEach((block) => {
    if (!isEmptyParagraph(block)) paragraphs += 1;
  });

  doc.descendants((node) => {
    if (node.isTextblock && node.textContent.trim() !== "") lines += 1;
  });

  return {
    words: text.split(/\s+/).filter((word) => word.length > 0).length,
    charactersWithoutSpaces: [...text.replace(/\s/g, "")].length,
    charactersWithSpaces: [...text.replace(/\n/g, "")].length,
    paragraphs,
    lines,
  };
};
