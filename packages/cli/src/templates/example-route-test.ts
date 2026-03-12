export function exampleRouteTestTemplate(): string {
  return `import request from "supertest";
import app from "../src/app.js";

describe("Tasks API", () => {
  let createdId: number;

  it("should return empty array initially on GET /api/tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should create a task on POST /api/tasks", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Write tests", description: "Add unit and integration tests" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Write tests");
    expect(res.body.completed).toBe(false);
    createdId = res.body.id;
  });

  it("should return 400 for invalid POST body", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should get a single task on GET /api/tasks/:id", async () => {
    const res = await request(app).get(\`/api/tasks/\${createdId}\`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Write tests");
  });

  it("should update a task on PUT /api/tasks/:id", async () => {
    const res = await request(app)
      .put(\`/api/tasks/\${createdId}\`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("should return 404 for non-existent PUT", async () => {
    const res = await request(app)
      .put("/api/tasks/9999")
      .send({ title: "Nope" });
    expect(res.status).toBe(404);
  });

  it("should delete a task on DELETE /api/tasks/:id", async () => {
    const res = await request(app).delete(\`/api/tasks/\${createdId}\`);
    expect(res.status).toBe(204);
  });

  it("should return 404 for non-existent DELETE", async () => {
    const res = await request(app).delete("/api/tasks/9999");
    expect(res.status).toBe(404);
  });
});
`;
}
