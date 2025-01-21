const express = require("express");
const catalystSDK = require("zcatalyst-sdk-node");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors({
    origin:'*'
}));
app.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
//Initialization of catalyst SDK using a middleware.
app.use((req, res, next) => {
  const catalyst = catalystSDK.initialize(req);
  res.locals.catalyst = catalyst;
  next();
});

//GET API. Get existing tasks if any from the server.
app.get("/tasks", async (req, res) => {
  try {
    const { catalyst } = res.locals;

    const zcql = catalyst.zcql();

    let query = `SELECT * FROM Tasks`;
    const allTasks = await zcql.executeZCQLQuery(query);

    res.status(200).send({
      status: "success",
      data: {
        allTasks,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
});

app.get("/:ROWID", async (req, res) => {
    try {
        const {ROWID} = req.params;
      const { catalyst } = res.locals;
  
      const zcql = catalyst.zcql();
  
      let query = `SELECT * FROM Tasks WHERE ROWID=${ROWID}`;
      const allTasks = await zcql.executeZCQLQuery(query);
  
      res.status(200).send({
        status: "success",
        data: {
          allTasks,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        status: "failure",
        message: "We're unable to process the request.",
      });
    }
  });
// POST API. Contains the logic to create a task
app.post("/tasks", async (req, res) => {
  try {
    const userPayload = req.body;
    const { catalyst } = res.locals;
    const table = catalyst.datastore().table("Tasks");
    const { ROWID: id } = await table.insertRow({
      title: userPayload.title,
      description: userPayload.description,
      status: "pending",
    });
    res.status(200).send({
      status: "success",
      data: {
        Tasks: {
          id,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
});

app.put("/tasks/:ROWID", async (req, res) => {
  try {
    const { ROWID } = req.params;
    const userPayload = req.body;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const id = parseInt(ROWID, 10);

    const query = `UPDATE Tasks SET title='${userPayload.title}', description='${userPayload.description}', status='${userPayload.status}' WHERE ROWID=${id}`;
    const updatedTask = await zcql.executeZCQLQuery(query);
    res.status(200).send({
      success: "true",
      updatedTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
});
// DELETE API. Contains the logic to delete a task.
app.delete("/tasks/:ROWID", async (req, res) => {
  try {
    const { ROWID } = req.params;
    const { catalyst } = res.locals;
    const table = catalyst.datastore().table("Tasks");
    await table.deleteRow(ROWID);
    res.status(200).send({
      status: "success",
      data: {
        todoItem: {
          id: ROWID,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
});
module.exports = app;
