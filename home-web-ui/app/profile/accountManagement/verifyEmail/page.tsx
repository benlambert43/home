const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const username = (await searchParams).username;
  const email = (await searchParams).email;
  const code = (await searchParams).code;

  return (
    <div className="p-5">
      <div>Verify Email</div>
      <div>
        {username} {email} {code}
      </div>
    </div>
  );
};

export default VerifyEmail;
