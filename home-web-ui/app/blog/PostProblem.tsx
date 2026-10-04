import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";

const PostProblem = ({
  headline,
  detail,
  page,
}: {
  headline: string;
  detail: string;
  page?: number;
}) => (
  <div className="mx-auto flex w-full flex-col gap-4 p-5 lg:w-2/3">
    <h1 className="text-4xl font-bold">{headline}</h1>
    <p>{detail}</p>
    <div>
      <ReturnToBlogPosts page={page} />
    </div>
  </div>
);

export default PostProblem;
