import { curate } from "@/app/projects/software/namegenerator/words/curate";
import { animals } from "unique-names-generator";

const PESTS = [
  "aphid",
  "bedbug",
  "earwig",
  "flea",
  "hookworm",
  "lamprey",
  "leech",
  "louse",
  "mite",
  "mosquito",
  "slug",
  "termite",
  "tick",
  "worm",
];

const TAXONOMY_WORDS = [
  "animal",
  "bird",
  "bovid",
  "bug",
  "canid",
  "canidae",
  "cattle",
  "felidae",
  "fish",
  "fowl",
  "gamefowl",
  "landfowl",
  "mammal",
  "pinniped",
  "primate",
  "reptile",
  "rodent",
  "wildfowl",
  "xerinae",
];

const OBSCURE_ANIMALS = [
  "antlion",
  "asp",
  "bass",
  "booby",
  "catshark",
  "coral",
  "cuckoo",
  "gayal",
  "guan",
  "kite",
  "leopon",
  "perch",
  "pike",
  "quelea",
  "sole",
  "swift",
  "tahr",
  "takin",
  "tiglon",
  "urial",
];

const UNFLATTERING_ANIMALS = [
  "chicken",
  "cow",
  "donkey",
  "pig",
  "rat",
  "turkey",
];

export const ANIMALS = curate(animals, [
  ...PESTS,
  ...TAXONOMY_WORDS,
  ...OBSCURE_ANIMALS,
  ...UNFLATTERING_ANIMALS,
]);
