module.exports = (sequelize, Sequelize) => {
    const SensorData = sequelize.define("sensordata", {
      temp: {
        type: Sequelize.STRING
      },
      humi: {
        type: Sequelize.STRING
      },
    });
    return SensorData;
  };