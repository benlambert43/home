import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import PageColumn from "@/app/components/PageColumn";

const PostProblem = ({
  headline,
  detail,
  page,
}: {
  headline: string;
  detail: string;
  page?: number;
}) => (
  <PageColumn className="flex flex-col gap-4">
    <h1 className="text-4xl font-bold">{headline}</h1>
    <p>{detail}</p>
    <div>
      <ReturnToBlogPosts page={page} />
    </div>
  </PageColumn>
);

export default PostProblem;
