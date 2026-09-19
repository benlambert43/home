const SITE_LOCALE = "en-US";

const SITE_TIME_ZONE = "America/Denver";

const PostDate = ({ date }: { date: string }) => (
  <time dateTime={date}>
    {new Date(date).toLocaleDateString(SITE_LOCALE, {
      timeZone: SITE_TIME_ZONE,
    })}
  </time>
);

export default PostDate;
