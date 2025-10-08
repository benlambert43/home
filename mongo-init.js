const username = process.env.MONGO_INITDB_ADMIN_USERNAME;
const workingpw = process.env.MONGO_INITDB_ADMIN_PASSWORD;
const database = process.env.MONGO_INITDB_DATABASE;

db.createUser({
  user: username,
  pwd: workingpw,
  roles: [
    {
      role: "readWrite",
      db: database,
    },
  ],
});
