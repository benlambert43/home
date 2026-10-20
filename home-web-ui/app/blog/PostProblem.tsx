import { POST_COLUMN_WIDTH_CLASS_NAME } from "@/app/blog/postColumn";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import PageColumn from "@/app/components/PageColumn";

const PostProblem = ({
  headline,
  detail,
}: {
  headline: string;
  detail: string;
}) => (
  <PageColumn
    className="flex flex-col gap-4"
    widthClassName={POST_COLUMN_WIDTH_CLASS_NAME}
  >
    <h1 className="text-4xl font-bold">{headline}</h1>
    <p>{detail}</p>
    <div>
      <ReturnToBlogPosts />
    </div>
  </PageColumn>
);

export default PostProblem;
