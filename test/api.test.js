const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path, options) {
  return fetch(`${baseUrl}${path}`, options);
}

test("starts empty and supports creating, reading, listing, and deleting doctor profiles", async () => {
  const initialList = await request("/doctors");
  assert.equal(initialList.status, 200);
  assert.deepEqual(await initialList.json(), []);

  const createResponse = await request("/doctors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Dr. Ada Lovelace", specialty: "Cardiology" }),
  });
  assert.equal(createResponse.status, 201);
  const doctor = await createResponse.json();
  assert.ok(doctor.id);
  assert.equal(doctor.name, "Dr. Ada Lovelace");

  const readResponse = await request(`/doctors/${doctor.id}`);
  assert.deepEqual(await readResponse.json(), doctor);

  const listResponse = await request("/doctors");
  assert.deepEqual(await listResponse.json(), [doctor]);

  const deleteResponse = await request(`/doctors/${doctor.id}`, { method: "DELETE" });
  assert.equal(deleteResponse.status, 204);
  assert.deepEqual(await (await request("/doctors")).json(), []);
});

test("replaces and partially updates existing doctor profiles", async () => {
  const createResponse = await request("/doctors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Dr. Grace Hopper", specialty: "Neurology" }),
  });
  const doctor = await createResponse.json();

  const patchResponse = await request(`/doctors/${doctor.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ specialty: "Computer Science" }),
  });
  assert.deepEqual(await patchResponse.json(), {
    id: doctor.id,
    name: "Dr. Grace Hopper",
    specialty: "Computer Science",
  });

  const putResponse = await request(`/doctors/${doctor.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Dr. Grace Hopper", specialty: "Engineering" }),
  });
  assert.deepEqual(await putResponse.json(), {
    id: doctor.id,
    name: "Dr. Grace Hopper",
    specialty: "Engineering",
  });
});

test("returns JSON errors for invalid profiles and unknown doctors", async () => {
  const malformedResponse = await request("/doctors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  assert.equal(malformedResponse.status, 400);
  assert.deepEqual(await malformedResponse.json(), {
    error: "Request body must contain valid JSON.",
  });

  const invalidResponse = await request("/doctors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify([]),
  });
  assert.equal(invalidResponse.status, 400);
  assert.deepEqual(await invalidResponse.json(), {
    error: "Doctor profile must be a JSON object.",
  });

  const missingResponse = await request("/doctors/not-a-doctor");
  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), { error: "Doctor not found." });

  const missingDelete = await request("/doctors/not-a-doctor", { method: "DELETE" });
  assert.equal(missingDelete.status, 404);
});
