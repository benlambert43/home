import Button from "@/app/ui/Button";
import Link from "next/link";

const VerificationProblem = (props: {
  headline: string;
  detail?: string;
  showRequestNewLink?: boolean;
}) => {
  const { headline, detail, showRequestNewLink } = props;

  return (
    <div className="p-5">
      <div>
        <div className="py-5">
          <p>{headline}</p>

          {detail ? <p>{detail}</p> : null}
        </div>
        {showRequestNewLink ? (
          <div className="py-5">
            <Link
              href={
                "/profile/accountManagement/requestNewEmailVerificationLink"
              }
            >
              <Button size="large">Request a New Link</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VerificationProblem;
