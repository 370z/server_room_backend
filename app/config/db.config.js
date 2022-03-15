module.exports = {
  HOST: "itdev.cmtc.ac.th",
  PORT: 2005,
  USER: "root",
  PASSWORD: "3fNjbOqfX7hy2lGPZZgtNA==",
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
