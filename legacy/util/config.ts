const Config = {
  key: process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a",
  dbCreds: `mongodb://${process.env.CURRENT_DB_ADDRESS}`
};

export default Config;
