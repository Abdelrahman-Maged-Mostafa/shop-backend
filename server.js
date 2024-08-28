const dotenv = require('dotenv');
const mongoose = require('mongoose');

// handel error should be hight in code and this for uncaughtException
process.on(`uncaughtException`, () => {
  process.exit(1);
});

/////////////////////////////// run server
dotenv.config({ path: './config.env' }); //should be before app require
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // console.log(connection.connections[0].base.connections[0].user);
  });
// .catch(() => console.log('Error'));
const app = require('./app');
// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`app running on port ${port}`));
//handel all error when you devolep like wrongf password from mongoDB
process.on(`unhandledRejection`, () => {
  // console.log([err.name, err.message]);
  //server close to close server normally to handell all closed server
  server.close(
    () => process.exit(1), //0 for normar and 1 for error
  );
});
