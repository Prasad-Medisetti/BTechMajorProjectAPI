module.exports = {
  db: process.env.MONGO_DB_LOCAL_URI || process.env.MONGO_DB_URI,
  // db: "mongodb://localhost:27017/notesapp",
};
