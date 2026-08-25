import Button from "@/app/ui/Button";

const VerificationProblem = ({
  headline,
  detail,
  showRequestNewLink,
}: {
  headline: string;
  detail?: string;
  showRequestNewLink?: boolean;
}) => (
  <div className="p-5">
    <div className="py-5">
      <p>{headline}</p>
      {detail ? <p>{detail}</p> : null}
    </div>
    {showRequestNewLink ? (
      <div className="py-5">
        <Button
          type="link"
          linkProps={{
            href: "/profile/accountManagement/requestNewEmailVerificationLink",
          }}
          size="large"
        >
          Request a New Link
        </Button>
      </div>
    ) : null}
  </div>
);

export default VerificationProblem;
