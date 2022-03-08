module.exports = {
  HOST: "itdev.cmtc.ac.th",
  USER: "root",
  PASSWORD: "3fNjbOqfX7hy2lGPZZgtNA==",
  DB: "server_room_temp",
  dialect: "mysql",
  timezone: "Asia/Bangkok",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
