import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";

const ALLOWED_TERMS = ["test"];

const dataset = englishDataset.addPhrase((phrase) =>
  ALLOWED_TERMS.reduce(
    (withTerm, term) => withTerm.addWhitelistedTerm(term),
    phrase,
  ),
);

const matcher = new RegExpMatcher({
  ...dataset.build(),
  ...englishRecommendedTransformers,
});

export const usernameHasProfanity = (username: string) =>
  matcher.hasMatch(username) || matcher.hasMatch(username.replace(/[_-]/g, ""));
