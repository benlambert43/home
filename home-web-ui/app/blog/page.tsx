import Blog from "@/app/blog/Blog";
import { blogPageMetadata } from "@/app/blog/blogPageMetadata";
import type { ResolvingMetadata } from "next";

export const generateMetadata = (_props: unknown, parent: ResolvingMetadata) =>
  blogPageMetadata(1, parent);

const FirstBlogPage = () => <Blog page={1} />;

export default FirstBlogPage;
