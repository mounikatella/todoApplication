const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const checkQueryValidations = async (request, response, next) => {
  const { status, priority, category, date, search_q } = request.query;
  const { todoId } = request.params;
  //Status Validation
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    isStatusValid = statusArray.includes(status);
    if (isStatusValid === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  //Priority Validation
  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    isPriorityValid = priorityArray.includes(priority);
    if (isPriorityValid === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  //Category Validation
  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    isCategoryValid = categoryArray.includes(category);
    if (isCategoryValid === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  //DueDate Validation
  if (date !== undefined) {
    const formatDate = format(new Date(date), "yyyy/MM/dd");
    isValidDate = isValid(formatDate);
    if (isValidDate === true) {
      request.date = formatDate;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
  //search_q validation
  if (search_q !== undefined) {
    request.search_q = search_q;
  } else {
    request.search_q = "";
  }
  next();
};

const checkRequestBodyValidations = async (request, response, next) => {
  const { status, priority, category, date } = request.body;
  const { todoId } = request.params;
  //Status Validation
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    isStatusValid = statusArray.includes(status);
    if (isStatusValid === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  //Priority Validation
  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    isPriorityValid = priorityArray.includes(priority);
    if (isPriorityValid === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  //Category Validation
  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    isCategoryValid = categoryArray.includes(category);
    if (isCategoryValid === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  //DueDate Validation
  if (date !== undefined) {
    const formatDate = format(new Date(date), "yyyy/MM/dd");
    isValidDate = isValid(date);
    if (isValidDate === true) {
      request.date = formatDate;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
  next();
};

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

//Get todo API
app.get("/todos/", checkQueryValidations, async (request, response) => {
  let responseBody = null;
  let getTodoQuery = "";
  const hasStatusAndPriorityProperties = (requestQuery) => {
    return (
      requestQuery.status !== undefined && requestQuery.priority !== undefined
    );
  };
  const hasCategoryAndStatusProperty = (requestQuery) => {
    return (
      requestQuery.category !== undefined && requestQuery.status !== undefined
    );
  };
  const hasCategoryAndPriorityProperties = (requestQuery) => {
    return (
      requestQuery.category !== undefined && requestQuery.priority !== undefined
    );
  };
  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };
  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };
  const hasCategoryProperty = (requestQuery) => {
    return requestQuery.category !== undefined;
  };
  const hasSearch_qProperty = (requestQuery) => {
    return requestQuery.search_q !== undefined;
  };

  switch (true) {
    case hasStatusAndPriorityProperties(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE status = '${request.status}'
            AND priority = '${request.priority}';`;
      break;
    case hasCategoryAndStatusProperty(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE status = '${request.status}'
            AND category = '${request.category}';`;
      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE priority = '${request.priority}'
            AND category = '${request.category}';`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE status = '${request.status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE priority = '${request.priority}'`;
      break;
    case hasCategoryProperty(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE category = '${request.category}'`;
      break;
    case hasSearch_qProperty(request.query):
      getTodoQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${request.search_q}%'`;
      break;
    default:
      getTodoQuery = `
            SELECT *
            FROM todo;`;
      break;
  }
  responseBody = await db.all(getTodoQuery);
  response.send(
    responseBody.map((eachTodo) => convertDbObjectToResponseObject(eachTodo))
  );
});

//Get Todo Based on Id API
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  let todo = await db.get(getTodoQuery);
  response.send(convertDbObjectToResponseObject(todo));
});

//Get Todo From Agenda API
app.get("/agenda/", async (request, response) => {
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE due_date = '${request.date}';`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//Create new todo API
app.post("/todos/", checkRequestBodyValidations, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodoQuery = `
    INSERT INTO 
        todo(id , todo, priority, status, category, due_date)
    VALUES(${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}')`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo API
app.put(
  "/todos/:todoId/",
  checkRequestBodyValidations,
  async (request, response) => {
    const { todoId } = request.params;
    const requestBody = request.body;
    let updatedColumn = "";
    switch (true) {
      case requestBody.status !== undefined:
        updatedColumn = "Status";
        break;
      case requestBody.priority !== undefined:
        updatedColumn = "Priority";
        break;
      case requestBody.todo !== undefined:
        updatedColumn = "Todo";
        break;
      case requestBody.category !== undefined:
        updatedColumn = "Category";
        break;
      case requestBody.dueDate !== undefined:
        updatedColumn = "Due Date";
        break;
    }
    const previousTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.dueDate,
    } = request.body;

    const updateTodoQuery = `
    UPDATE todo
    SET 
        todo = '${todo}',
        priority = '${priority}',
        status = '${status}',
        category = '${category}',
        due_date = '${dueDate}'
    WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updatedColumn} Updated`);
  }
);

//Delete Todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
