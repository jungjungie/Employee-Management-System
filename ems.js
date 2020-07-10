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
    
    console.log('================================================\n');
    console.log(figlet.textSync('            EMS', {
        font: 'big',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }));
    console.log("        -- Employee Management System --\n");
    console.log('================================================\n');

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
    ]).then(function ({ menuChoice }) {
        switch (menuChoice) {
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
    inquirer.prompt([
        {
            message: 'What would you like to do?',
            name: 'updateChoice',
            type: 'list',
            choices: ['Add Employee', 'Add Role', 'Add Department', 'Update Employee Role', 'Go Back']
        }
    ]).then(function ({ updateChoice }) {
        switch (updateChoice) {
            case 'Add Employee':
                addEmployee();
                break;
            case 'Add Role':
                console.log('Add Role');
                mainMenu();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Update Employee Role':
                console.log('Update Employee Role');
                mainMenu();
                break;
            case 'Go Back':
                mainMenu();
        }
    });
}

// Function to add new department
const addDept = () => {
    inquirer.prompt([
        {
            message: 'Enter the name of the new department:',
            name: 'newDept',
            type: 'input'
        }
    ]).then(function ({ newDept }) {
        connection.query("SELECT department FROM departments", function(err, data) {
            if (err) throw err;

            // If no departments currently exist, then adds the new department
            if (data.length === 0) {
                connection.query("INSERT INTO departments (department) VALUES (?)", [newDept], function(err, data) {
                    if(err) throw err;              
                    console.log(`\n---------------------------------------------------\n`);     
                    console.log(`\nNEW DEPARTMENT SUCCESSFULLY ADDED: ${ newDept }\n`);
                    console.log(`\n---------------------------------------------------\n`);     
        
                    mainMenu();
                });
            } else {
            // Loops through to check for new dept name in database and returns an error if it already exists
                for (let i=0; i < data.length; i++) {
                    if (newDept === data[i].department) {
                        console.log(`\n---------------------------------------------------\n`);     
                        console.log(`\nERROR: A ${data[i].department} department already exists. Please try again.\n`);
                        console.log(`\n---------------------------------------------------\n`);     
                        addDept();
                        return;
                    }
                }
            // Adds new dept to the database if it does not already exist in database
                connection.query("INSERT INTO departments (department) VALUES (?)", [newDept], function(err, data) {
                    if(err) throw err;
                    console.log(`\n---------------------------------------------------\n`);     
                    console.log(`\nNEW DEPARTMENT SUCCESSFULLY ADDED: ${ newDept }\n`);
                    console.log(`\n---------------------------------------------------\n`);     
                    mainMenu();
                });
            }
        })
    });
}

const viewData = () => {
    inquirer.prompt([
        {
            message: 'What would you like to do?',
            name: 'viewChoice',
            type: 'list',
            choices: ['View All Employees', 'View All Roles', 'View All Departments', 'Go Back']
        }
    ]).then(function ({ viewChoice }) {
        switch (viewChoice) {
            case 'View All Employees':
                viewEmployees();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Departments':
                viewDepts();
                break;
            case 'Go Back':
                mainMenu();
        }
    });
}

const viewEmployees = () => {
    let query = "SELECT employees.id, employees.first_name, employees.last_name, roles.position_title, departments.department, roles.salary, employees.manager_id FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.dept_id = departments.id";
    accessSQL(query);
}

const viewRoles = () => {
    let query = "SELECT roles.id, roles.position_title, roles.salary, departments.department FROM roles INNER JOIN departments ON roles.dept_id = departments.id";
    accessSQL(query);
}

const viewDepts = () => {
    let query = "SELECT * FROM departments";
    accessSQL(query);
}

const accessSQL = query => {
    connection.query(query, (err, data) => {
        if (err) throw err;

        // Returns 'no data exists' if there is no data
        if (data.length === 0) {
            console.log(`\n---------------------------------------------------\n`);     
            console.log('No data exists.')
            console.log(`\n---------------------------------------------------\n`);   
            mainMenu();  
        } else {
        // Returns available data
            console.log(`\n---------------------------------------------------\n\n`);     
            console.log(cTable.getTable(data));
            console.log(`---------------------------------------------------\n`);     
            mainMenu();
        }
    })
}