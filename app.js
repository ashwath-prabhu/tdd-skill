const express = require('express');
const createUserRouter = require('./routes/create_user');
const listUsersRouter = require('./routes/list_users');
const viewUserRouter = require('./routes/view_user');
const updateUserRouter = require('./routes/update_user');
const deleteUserRouter = require('./routes/delete_user');
const registerRouter = require('./routes/register');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', createUserRouter);
app.use('/', listUsersRouter);
app.use('/', viewUserRouter);
app.use('/', updateUserRouter);
app.use('/', deleteUserRouter);
app.use('/', registerRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
