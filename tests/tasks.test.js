process.env.TASKS_DB_PATH = ":memory:";

const request = require("supertest");
const app = require("../app");

describe("GET /tasks", () => {
  it("should return the three seeded tasks", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
  });

  it("should filter by done=true", async () => {
    const res = await request(app).get("/tasks?done=true");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((task) => expect(task.done).toBe(true));
  });

  it("should reject an invalid done value", async () => {
    const res = await request(app).get("/tasks?done=maybe");
    expect(res.statusCode).toBe(400);
  });

  it("should search by title", async () => {
    const res = await request(app).get("/tasks?search=milk");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title.toLowerCase()).toContain("milk");
  });

  it("should sort alphabetically by title", async () => {
    const res = await request(app).get("/tasks?sort=title");
    const titles = res.body.data.map((t) => t.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });
});

describe("POST /tasks", () => {
  it("should create a new task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Write tests" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe("Write tests");
    expect(res.body.data.done).toBe(false);
  });

  it("should reject a missing title", async () => {
    const res = await request(app).post("/tasks").send({});
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /tasks/:id", () => {
  it("should return a single task", async () => {
    const res = await request(app).get("/tasks/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it("should return 404 for an unknown id", async () => {
    const res = await request(app).get("/tasks/9999");
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /tasks/:id", () => {
  it("should update a task", async () => {
    const res = await request(app).put("/tasks/1").send({ done: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.done).toBe(true);
  });

  it("should return 404 when updating an unknown id", async () => {
    const res = await request(app).put("/tasks/9999").send({ done: true });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /tasks/:id", () => {
  it("should delete a task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Temporary task" });
    const id = created.body.data.id;

    const res = await request(app).delete(`/tasks/${id}`);
    expect(res.statusCode).toBe(200);

    const check = await request(app).get(`/tasks/${id}`);
    expect(check.statusCode).toBe(404);
  });
});

describe("GET /stats", () => {
  it("should return total, completed, and pending counts", async () => {
    const res = await request(app).get("/stats");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("total");
    expect(res.body.data).toHaveProperty("completed");
    expect(res.body.data).toHaveProperty("pending");
  });
});
