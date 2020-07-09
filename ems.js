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

    mainMenu();
});

const mainMenu = () => {
    inquirer.prompt([
        {
            message: 'Please select an option below:',
            name: 'menuChoice',
            type: 'list',
            choices: ['ADD, CHANGE or REMOVE DATA', 'VIEW DATA', 'EXIT APPLICATION']
        }
    ]).then(function({ menuChoice }) {
        switch(menuChoice) {
            case 'ADD, CHANGE or REMOVE DATA':
                updateData();
                break;
            case 'VIEW DATA':
                viewData();
                break;
            case 'EXIT APPLICATION':
                connection.end();
                break;
        }
    });
}

const updateData = () => {
    console.log('ADD, CHANGE or REMOVE DATA');
}

const viewData = () => {
    console.log('VIEW DATA');
}