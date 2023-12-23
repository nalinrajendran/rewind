const mongoose = require('mongoose');

module.exports = () => {
  mongoose.set('strictQuery', false);
  return mongoose
    .connect(process.env.MONGO_URL || 'mongodb+srv://sde_project:UBDfGrzq8LJNBrOF@cluster0.yrxkwf7.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
      console.log('Mongodb Connected');
    })
    .catch((err) => {
      console.log(err);
      throw new Error('Error occcured while connecting to database');
    });
};
