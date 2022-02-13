const mysql = require('mysql');
require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: "",
  database: 'cours-discord'
});

module.exports.connect = () => {
  connection.connect((error) => {
    if (error) {
      console.error('An error occured while connecting to the database: ' + error);
    } else {
      console.log('Connection to the database established.');
    }
  });
};

module.exports.executeQuery = (query) => {
  if (connection.state === 'disconnected') {
    // Ne pas oublier d'appeler la fonction connect avant de faire des requètes à la base de donnée
    throw new Error('There is no connection to the database, don\'t forget to call the \'connect\' method before executing queries!');
  }
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  })
};
