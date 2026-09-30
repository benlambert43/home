"use client";

import { useState } from "react";

const LOCAL_PART = "benlambertdottech";

const DOMAIN = "gmail.com";

const OBSCURED_ADDRESS = `${LOCAL_PART} [at] ${DOMAIN.replace(".", " [dot] ")}`;

const ContactEmail = () => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    const address = `${LOCAL_PART}@${DOMAIN}`;
    return <a href={`mailto:${address}`}>{address}</a>;
  }

  return (
    <button
      type="button"
      title="Show email address"
      onClick={() => setRevealed(true)}
      className="font-medium text-slate-50 underline hover:cursor-pointer"
    >
      {OBSCURED_ADDRESS}
    </button>
  );
};

export default ContactEmail;
