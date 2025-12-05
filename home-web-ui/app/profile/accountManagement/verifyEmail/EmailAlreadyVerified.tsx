"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

const EmailAlreadyVerified = () => {
  useEffect(() => {
    redirect("/profile");
  }, []);

  return <div className="p-5 py-5">{""}</div>;
};

export default EmailAlreadyVerified;
