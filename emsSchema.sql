DROP DATABASE IF EXISTS employees_db;

CREATE DATABASE employees_db;
USE employees_db;

CREATE TABLE departments(
    id INT(10) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    department VARCHAR(30) NOT NULL
);

CREATE TABLE roles(
    id INT(10) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    position_title VARCHAR(30) NOT NULL,
    salary DECIMAL(8,2) NOT NULL,
    dept_id INT(10) NOT NULL
);

CREATE TABLE employees(
    id INT(10) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT(10) NOT NULL,
    manager_id INT(10)
);