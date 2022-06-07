module.exports = {
  HOST: "itdev.cmtc.ac.th",
  PORT: 3803,
  USER: "root",
  PASSWORD: "iylbpkooNM@2022==",
  DB: "server_room_temp",
  dialect: "mysql",
  timezone: "+07:00",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
