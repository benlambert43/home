import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";

const PostProblem = ({
  headline,
  detail,
}: {
  headline: string;
  detail: string;
}) => (
  <div className="flex max-w-160 flex-col gap-4 p-5">
    <h1 className="text-4xl font-bold">{headline}</h1>
    <p>{detail}</p>
    <div>
      <ReturnToBlogPosts />
    </div>
  </div>
);

export default PostProblem;
