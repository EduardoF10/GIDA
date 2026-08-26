const express = require("express");
const ProjectType = require("../models/projectTypeModel");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const types = await ProjectType.findAll();
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
