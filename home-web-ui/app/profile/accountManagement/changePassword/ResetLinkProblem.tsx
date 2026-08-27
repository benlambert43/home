import Button from "@/app/ui/Button";

const ResetLinkProblem = ({
  headline,
  detail,
}: {
  headline: string;
  detail?: string;
}) => (
  <div className="p-5">
    <div className="py-5">
      <p>{headline}</p>
      {detail ? <p>{detail}</p> : null}
    </div>
    <div className="py-5">
      <Button type="link" linkProps={{ href: "/forgotpassword" }} size="large">
        Request a New Link
      </Button>
    </div>
  </div>
);

export default ResetLinkProblem;
