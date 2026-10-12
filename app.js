const express = require("express");
const { randomUUID } = require("node:crypto");

const app = express();
const doctors = new Map();

app.use(express.json());

function isProfile(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

app.get("/doctors", (req, res) => {
  res.json([...doctors.values()]);
});

app.post("/doctors", (req, res) => {
  if (!isProfile(req.body)) {
    return res.status(400).json({ error: "Doctor profile must be a JSON object." });
  }

  const doctor = { ...req.body, id: randomUUID() };
  doctors.set(doctor.id, doctor);
  return res.status(201).json(doctor);
});

app.get("/doctors/:id", (req, res) => {
  const doctor = doctors.get(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  return res.json(doctor);
});

app.put("/doctors/:id", (req, res) => {
  if (!isProfile(req.body)) {
    return res.status(400).json({ error: "Doctor profile must be a JSON object." });
  }

  if (!doctors.has(req.params.id)) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  const doctor = { ...req.body, id: req.params.id };
  doctors.set(doctor.id, doctor);
  return res.json(doctor);
});

app.patch("/doctors/:id", (req, res) => {
  if (!isProfile(req.body)) {
    return res.status(400).json({ error: "Doctor profile must be a JSON object." });
  }

  const existingDoctor = doctors.get(req.params.id);
  if (!existingDoctor) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  const doctor = { ...existingDoctor, ...req.body, id: req.params.id };
  doctors.set(doctor.id, doctor);
  return res.json(doctor);
});

app.delete("/doctors/:id", (req, res) => {
  if (!doctors.delete(req.params.id)) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  return res.status(204).end();
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Request body must contain valid JSON." });
  }

  return next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Doctor directory API listening on port ${port}`);
  });
}

module.exports = app;
