import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const requestNewEmailVerificationLinkSuccess = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value !== "string") redirect("/signin");

  return (
    <div className="mx-4 flex flex-col gap-2 py-8">
      <div>
        A new verification email has been sent! Be sure to check your junk or
        spam folders.
      </div>
      <div>
        <Link
          href={"http://google.com/gmail"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex max-w-80 gap-x-2 rounded-sm bg-slate-500 px-2 py-1
            hover:cursor-pointer hover:bg-slate-400 focus:outline-slate-100"
        >
          <div className="flex items-center justify-center px-1">
            <EnvelopeIcon className="size-6" />
          </div>
          Open Gmail
        </Link>
      </div>
    </div>
  );
};

export default requestNewEmailVerificationLinkSuccess;
