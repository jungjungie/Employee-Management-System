INSERT INTO departments (department)
VALUES ('Sales'), ('Marketing'), ('Engineering');

INSERT INTO roles (position_title, salary, dept_id)
VALUES ('Sales Manager', '145000.00', '1'), 
('Sales Rep', '90000.00', '1'), 
('Marketing Director', '150000.00', '2'),
('Marketer', '110000.00', '2'),
('Lead Engineer', '150000.00', '3'),
('Software Engineer', '120000.00', '3');

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('Jane', 'Miller', 1, null),
('Bob', 'Craft', 2, 1),
('John', 'Silva', 3, null),
('Laura', 'Smith', 4, 3),
('Dave', 'Riley', 5, null),
('Nancy', 'Frank', 6, null);