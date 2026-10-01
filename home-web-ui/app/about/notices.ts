export const PRIVACY_NOTICE = {
  href: "/about/privacy",
  title: "Privacy Notice",
  description:
    "What information this site collects, why, who else handles it, and your choices.",
};

export const COOKIE_NOTICE = {
  href: "/about/cookies",
  title: "Cookie Notice",
  description:
    "The cookies this site sets, what each one does, and how long it lasts.",
};

export const TERMS_OF_USE = {
  href: "/about/terms",
  title: "Terms of Use",
  description: "The rules for using this site and holding an account on it.",
};

export const NO_WARRANTY_ID = "no-warranty";

export const NO_WARRANTY_HREF = `${TERMS_OF_USE.href}#${NO_WARRANTY_ID}`;

export const ACCOUNTS_AND_EMAIL = {
  href: "/about/accounts",
  title: "Accounts and Email",
  description:
    "How accounts work, which emails this site sends, and how to change or delete your account.",
};

export const SOURCE_AND_LICENSES = {
  href: "/about/licenses",
  title: "Source and Licenses",
  description:
    "Where this site's source code lives, how it is licensed, and the open-source software it is built with.",
};

export const NOTICES = [
  PRIVACY_NOTICE,
  COOKIE_NOTICE,
  TERMS_OF_USE,
  ACCOUNTS_AND_EMAIL,
  SOURCE_AND_LICENSES,
];
