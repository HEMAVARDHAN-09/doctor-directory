# Doctor Directory API

A REST API for managing doctor profiles. Profiles are kept only in server memory:
the directory starts empty each time the server starts, and all records are lost
when it stops. There is no database, JSON-file storage, or startup seed data.

## Run

```sh
npm install
npm start
```

The server listens on port `3000` by default. Set the `PORT` environment variable
to use a different port.

## Endpoints

All request and response bodies use JSON. A doctor profile is a JSON object with
the fields your application needs; the API assigns its `id`.

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/doctors` | Return all doctor profiles |
| `POST` | `/doctors` | Create a profile; returns `201` and the created profile |
| `GET` | `/doctors/:id` | Return one profile |
| `PUT` | `/doctors/:id` | Replace a profile |
| `PATCH` | `/doctors/:id` | Update selected profile fields |
| `DELETE` | `/doctors/:id` | Delete a profile; returns `204` |

Unknown doctor IDs return `404`. A request body that is not a JSON object returns
`400`. `id` values supplied in create or update bodies are ignored.

### Example

```sh
curl -X POST http://localhost:3000/doctors \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Ada Lovelace","specialty":"Cardiology","email":"ada@example.com"}'
```
