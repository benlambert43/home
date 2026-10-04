import PageColumn from "@/app/components/PageColumn";
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
  <PageColumn>
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
  </PageColumn>
);

export default VerificationProblem;
