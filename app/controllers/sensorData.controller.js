const db = require("../models");
const SensorData = db.sensorData;

// Get all sensordata => /api/v1/sensorData
exports.getSensorData = async (req, res, next) => {
  try {
    let sensorDatas = await SensorData.findAll();
    res.json(sensorDatas);
  } catch (error) {
    res.json(error)
  }
};

