const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const dbpath = path.join(__dirname, 'todoApplication.db')
let db = null

const intializeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running')
    })
  } catch (e) {
    console.log(`Unable to run ${e.message}`)
    process.exit(1)
  }
}
intializeServer()
app.get('/todos/', async (request, response) => {
  let getTodosQuery = ''
  let {status, priority, search_q = ''} = request.query
  const hasPriorityAndStatusProperties = requestQuery => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    )
  }
  const hasPriorityProperty = requestQuery => {
    return requestQuery.priority !== undefined
  }
  const hasStatusProperty = requestQuery => {
    return requestQuery.status !== undefined
  }

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }
  const todoItems = await db.all(getTodosQuery)
  response.send(todoItems)
})
// GET based on Id

app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  const todoQuery = `SELECT * FROM todo WHERE id=${todoId}`
  const todoItem = await db.get(todoQuery)
  response.send(todoItem)
})

//POST REQUEST

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const insertTodo = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES (${id},'${todo}','${priority}','${status}');`
  await db.run(insertTodo)
  response.send('Todo Successfully Added')
})
//UPDATE REQUEST

app.put('/todos/:todoId/', async (request, response) => {
  let {todo, priority, status} = request.body
  let {todoId} = request.params
  const updateTodo = todorequest => {
    return todorequest.todo !== undefined
  }
  const updateStatus = todorequest => {
    return todorequest.status !== undefined
  }
  const updatePriority = todorequest => {
    return todorequest.priority !== undefined
  }
  switch (true) {
    case updateTodo(request.body): {
      const updateQuery = `UPDATE todo SET todo='${request.body.todo}' 
      WHERE id=${todoId};`
      await db.run(updateQuery)
      response.send('Todo Updated')
      break
    }
    case updateStatus(request.body): {
      const updateQuery = `UPDATE todo SET status='${request.body.status}'
      WHERE id=${todoId};`
      await db.run(updateQuery)
      response.send('Status Updated')
      break
    }
    case updatePriority(request.body): {
      const updateQuery = `UPDATE todo SET priority='${request.body.priority}'
      WHERE id=${todoId};`
      await db.run(updateQuery)
      response.send('Priority Updated')

      break
    }
  }
})

//DELETE

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `Delete FROM todo WHERE id=${todoId}`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
