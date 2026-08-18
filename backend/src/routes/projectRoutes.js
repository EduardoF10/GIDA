const express = require("express");
const Project = require("../models/projectModel");

const router = express.Router();

function parseId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid project id");
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function sendError(res, err, fallbackStatus) {
  const status = err.statusCode || fallbackStatus;
  res.status(status).json({ error: err.message });
}

router.get("/", async (_req, res) => {
  try {
    const projects = await Project.findAll();
    res.status(200).json(projects);
  } catch (err) {
    sendError(res, err, 500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(parseId(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (err) {
    sendError(res, err, 500);
  }
});

router.post("/", async (req, res) => {
  try {
    const savedProject = await Project.create(req.body);
    res.status(201).json(savedProject);
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedProject = await Project.update(parseId(req.params.id), req.body);
    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(updatedProject);
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.remove(parseId(req.params.id));
    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(deletedProject);
  } catch (err) {
    sendError(res, err, 500);
  }
});

module.exports = router;
