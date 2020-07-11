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

// Function to prompt main menu options
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

// Function to prompt choices for adding, changing or removing data
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
                addRole();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Go Back':
                mainMenu();
        }
    });
}

// Function to add new employee
const addEmployee = () => {
    connection.query("SELECT roles.id AS roleID, roles.position_title AS role, employees.id AS employeeID, CONCAT(employees.first_name, ' ', employees.last_name) AS employee FROM employees RIGHT OUTER JOIN roles ON employees.role_id = roles.id", function (err, data) {
        if (err) throw err;
        // console.log(data);

        let roleChoices = [];
        let mgrChoices = [];

        data.forEach(({ roleID, role }, i) => {
            // Pulls the roleID and role and creates a new object if the values are not null
            if (roleID && role) {
                const uniqueRole = {
                    name: role,
                    value: roleID
                }
                //Determines if this is the first occurrence of the role in the array and pushes it to roleChoices if it is
                const index = data.findIndex(roleObj => roleObj.roleID === roleID);

                if (index === i) {
                    roleChoices.push(uniqueRole);
                }
            }
        })

        data.forEach(({ employeeID, employee }, i) => {
            // Pulls the employeeID and employee and creates a new object if the values are not null
            if (employeeID && employee) {
                const uniqueEmployee = {
                    name: employee,
                    value: employeeID
                }
                //Determines if this is the first occurrence of the role in the array and pushes it to mgrChoices if it is
                const index = data.findIndex(employeeObj => employeeObj.employeeID === employeeID);

                if (index === i) {
                    mgrChoices.push(uniqueEmployee);
                }
            }
        })

        inquirer.prompt([
            {
                message: 'Enter the employee\'s first name:',
                name: 'firstName',
                type: 'input'
            },
            {
                message: 'Enter the employee\'s last name:',
                name: 'lastName',
                type: 'input'
            },
            {
                message: 'Enter the employee\'s role:',
                name: 'role',
                type: 'list',
                choices: roleChoices
            },
            {
                message: 'Enter the employee\'s manager:',
                name: 'manager',
                type: 'list',
                choices: mgrChoices
            }
        ]).then(function ({ firstName, lastName, role, manager }) {
            console.log(firstName, lastName, role, manager);

            // Adds the new employee into database
            connection.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [firstName, lastName, role, manager], function (err, data) {
                if (err) throw err;
                console.log(`\n---------------------------------------------------\n`);
                console.log(`\nNEW EMPLOYEE SUCCESSFULLY ADDED: ${firstName} ${lastName}\n`);
                console.log(`\n---------------------------------------------------\n`);
                mainMenu();
            });
        });
    });
}

// Function to add new role
const addRole = () => {
    connection.query("SELECT * FROM departments", function (err, data) {
        if (err) throw err;

        let deptChoices = [];
        let deptIds = [];

        for (let i = 0; i < data.length; i++) {
            deptChoices.push(data[i].department);
            deptIds.push(data[i].id);
        }

        inquirer.prompt([
            {
                message: 'Enter the position title for the new role:',
                name: 'newRole',
                type: 'input'
            },
            {
                message: 'Enter the salary for the new role:',
                name: 'salary',
                type: 'number'
            },
            {
                message: 'Select the new role\'s department:',
                name: 'dept',
                type: 'list',
                choices: deptChoices
            }
        ]).then(function ({ newRole, salary, dept }) {
            connection.query("SELECT position_title FROM roles", function (err, data) {
                if (err) throw err;
                let deptId;

                // Selects the dept id of the department selected
                for (let i = 0; i < deptChoices.length; i++) {
                    if (dept === deptChoices[i]) {
                        deptId = deptIds[i];
                    }
                }

                // If no roles currently exist, then adds the new role
                if (data.length === 0) {
                    connection.query("INSERT INTO roles (position_title, salary, dept_id) VALUES (?, ?, ?)", [newRole, salary, deptId], function (err, data) {
                        if (err) throw err;
                        console.log(`\n---------------------------------------------------\n`);
                        console.log(`\nNEW POSITION SUCCESSFULLY ADDED: ${newRole}\n`);
                        console.log(`Salary: ${salary}\n`);
                        console.log(`Department: ${dept}\n`);
                        console.log(`\n---------------------------------------------------\n`);

                        mainMenu();
                    });
                } else {
                    // Loops through to check for new role in database and returns an error if it already exists
                    for (let i = 0; i < data.length; i++) {
                        if (newRole === data[i].position_title) {
                            console.log(`\n---------------------------------------------------\n`);
                            console.log(`\nERROR: The position title ${data[i].position_title} already exists. Please try again.\n`);
                            console.log(`\n---------------------------------------------------\n`);
                            addRole();
                            return;
                        }
                    }
                    // Adds new role to the database if it does not already exist in database
                    connection.query("INSERT INTO roles (position_title, salary, dept_id) VALUES (?, ?, ?)", [newRole, salary, deptId], function (err, data) {
                        if (err) throw err;
                        console.log(`\n---------------------------------------------------\n`);
                        console.log(`\nNEW POSITION SUCCESSFULLY ADDED: ${newRole}\n`);
                        console.log(`Salary: ${salary}\n`);
                        console.log(`Department: ${dept}\n`);
                        console.log(`\n---------------------------------------------------\n`);
                        mainMenu();
                    });
                }
            })
        });
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
        connection.query("SELECT department FROM departments", function (err, data) {
            if (err) throw err;

            // If no departments currently exist, then adds the new department
            if (data.length === 0) {
                connection.query("INSERT INTO departments (department) VALUES (?)", [newDept], function (err, data) {
                    if (err) throw err;
                    console.log(`\n---------------------------------------------------\n`);
                    console.log(`\nNEW DEPARTMENT SUCCESSFULLY ADDED: ${newDept}\n`);
                    console.log(`\n---------------------------------------------------\n`);

                    mainMenu();
                });
            } else {
                // Loops through to check for new dept name in database and returns an error if it already exists
                for (let i = 0; i < data.length; i++) {
                    if (newDept === data[i].department) {
                        console.log(`\n---------------------------------------------------\n`);
                        console.log(`\nERROR: A ${data[i].department} department already exists. Please try again.\n`);
                        console.log(`\n---------------------------------------------------\n`);
                        addDept();
                        return;
                    }
                }
                // Adds new dept to the database if it does not already exist in database
                connection.query("INSERT INTO departments (department) VALUES (?)", [newDept], function (err, data) {
                    if (err) throw err;
                    console.log(`\n---------------------------------------------------\n`);
                    console.log(`\nNEW DEPARTMENT SUCCESSFULLY ADDED: ${newDept}\n`);
                    console.log(`\n---------------------------------------------------\n`);
                    mainMenu();
                });
            }
        })
    });
}

// Function to update employee's role
// Update employee's mgr, role, name
const updateEmployeeRole = () => {
    connection.query("SELECT roles.id AS roleID, roles.position_title AS role, employees.id AS employeeID, CONCAT(employees.first_name, ' ', employees.last_name) AS employee FROM employees RIGHT OUTER JOIN roles ON employees.role_id = roles.id", function (err, data) {
        if (err) throw err;
        // console.log(data);

        let employeeChoices = [];
        let roleChoices = [];

        data.forEach(({ employeeID, employee }, i) => {
            // Pulls the employeeID and employee and creates a new object if the values are not null
            if (employeeID && employee) {
                const uniqueEmployee = {
                    name: employee,
                    value: employeeID
                }
                //Determines if this is the first occurrence of the role in the array and pushes it to employeeChoices if it is
                const index = data.findIndex(employeeObj => employeeObj.employeeID === employeeID);

                if (index === i) {
                    employeeChoices.push(uniqueEmployee);
                }
            }
        })

        data.forEach(({ roleID, role }, i) => {
            // Pulls the roleID and role and creates a new object if the values are not null
            if (roleID && role) {
                const uniqueRole = {
                    name: role,
                    value: roleID
                }
                //Determines if this is the first occurrence of the role in the array and pushes it to roleChoices if it is
                const index = data.findIndex(roleObj => roleObj.roleID === roleID);

                if (index === i) {
                    roleChoices.push(uniqueRole);
                }
            }
        })

        inquirer.prompt([
            {
                message: 'Which employee\'s role do you want to update?',
                name: 'employee',
                type: 'list',
                choices: employeeChoices
            },
            {
                message: 'What is the employee\'s new role?',
                name: 'newRole',
                type: 'list',
                choices: roleChoices
            }
        ]).then(function ({ employee, newRole }) {
            // Updates the employee role in database
            connection.query("UPDATE employees SET ? WHERE ?", [
                { role_id: newRole },
                { id: employee }
            ], function (err, data) {
                if (err) throw err;
                console.log(`\n---------------------------------------------------\n`);
                console.log(`\nEMPLOYEE DATA SUCCESSFULLY UPDATED\n`);
                console.log(`\n---------------------------------------------------\n`);
                mainMenu();
            });
        });
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
    let query = "SELECT employees.id, employees.first_name, employees.last_name, roles.position_title, departments.department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.dept_id = departments.id LEFT JOIN employees as manager ON manager.id = employees.manager_id";
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

        // make new array and rebuild data in it, or try map function and toFixed()
        let formattedArr = [];

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