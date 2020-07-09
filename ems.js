// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');
const figlet = require('figlet');
require('dotenv').config();

// Connection to MySQL
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_PASS,
    database: "employees_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);    
});