module.exports = app => {
    const sensorDatas = require("../controllers/sensorData.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", sensorDatas.create);
  
    // Retrieve all sensorDatas
    router.get("/", sensorDatas.findAll);
  
    // Retrieve all published sensorDatas
    router.get("/published", sensorDatas.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", sensorDatas.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", sensorDatas.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", sensorDatas.delete);
  
    // Delete all sensorDatas
    router.delete("/", sensorDatas.deleteAll);
  
    app.use('/api/sensorDatas', router);
  };