import { Request, response, Response } from 'express';
import Project from '../models/projectModel';
import axios from 'axios';
import { error } from 'console';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { project_id, org_id, client_id, project_name, start_date, end_date, status,
            total_budget, allocated_budget, remaining_budget, employee_budget,
            technical_budget, additional_budget, employee_expenses,
            technical_expenses, additional_expenses, actual_expenses, employees_list } = req.body;
        //validating budget
        //const list = [1];
        if (total_budget < allocated_budget || employee_budget > allocated_budget) {
            res.status(400).json({ error: "exceeding the budget" });
            return;
        }
        const remainingBudget = allocated_budget;
        const projectData = {
            project_id, org_id, client_id, project_name, start_date, end_date, status,
            total_budget, allocated_budget, remaining_budget: remainingBudget, employee_budget,
            technical_budget, additional_budget, employee_expenses,
            technical_expenses, additional_expenses, actual_expenses, employees_list
        };

        const savedProject = await Project.create(projectData);

        res.status(201).json(savedProject);
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' + error });
    }
};


export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({ project_id: req.params.id });
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        // const response = await axios.get(`http://localhost:3000/api/employees/projects/${req.params.id}`);
        // if (project !== null) {
        //     const employeeIds = response.data.map((employee: { employee_id: number }) => employee.employee_id);
        //     project.employees_list = employeeIds;
        // }
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' + error });
    }
}

export const getAll = async (req: Request, res: Response) => {
    const project = await Project.find();
    res.status(200).json(project);

}

export const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({ project_id: req.params.id });

        if (!project)
            res.status(404).json({ message: 'Project not found' });

        if (req.body.allocated_budget < req.body.employee_budget + req.body.technical_budget + req.body.additional_budget) {
            res.status(400).json({ error: "budget is exceeding the allocated budget" });
            return;
        }

        if (project !== null) {
            if (req.body.status === "completed") {
                if (project.employees_list.length !== 0) {
                    for (const employeeId of project.employees_list) {
                        console.log(employeeId);
                        await axios.get(`http://localhost:3000/employees/projectCompleted/${employeeId}`);
                    }
                }
                project.status = "completed";
            }
            else if (req.body.status === "ongoing") {
                const project_id = req.params.id;
                //console.log(project_id);
                if (project.employees_list.length !== 0) {
                    for (const employeeId of project.employees_list) {
                        await axios.get(`http://localhost:3000/employees/assignProject/${employeeId}/${project_id}`);
                    }
                }

                project.status = "ongoing";
            }
            const updatedProject = await Project.findOneAndUpdate(
                { project_id: req.params.id },
                req.body,
                { new: true, runValidators: true }  // Returns the updated document
            );

            res.status(200).json(updatedProject);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occured' + error });
    }
};


export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOneAndDelete({ project_id: req.params.id });

        if (!project) {
            // Send 404 response and return to avoid further execution
            res.status(404).json({ message: "Project not found" });
            return;
        }

        // Send success response if project was deleted
        res.status(200).json({ message: "Project deleted successfully!" });
    } catch (error) {
        // Send 500 response if there's an error
        res.status(500).json({ message: "An unexpected error occurred" });
    }
};


export const getProjectsByOrgId = async (req: Request, res: Response) => {
    try {
        const project = await Project.find({ org_id: req.params.org_id });
        if (!project)
            res.status(404).json({ message: "there is project with given id" });
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ messsage: "An unexpected error occured" });
    }
}

export const getProjectsByClientId = async (req: Request, res: Response) => {
    try {
        const project = await Project.find({ client_id: req.params.client_id });
        if (!project)
            res.status(404).json({ message: "there is project with given id" });
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ messsage: "An unexpected error occured" });
    }
}


export const updateProjectStatus = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({ project_id: req.params.project_id });
        if (!project)
            res.status(404).json({ message: "Project not found" });
        if (project !== null) {
            if (req.params.status === "completed") {
                project.status = "completed";
                for (const employeeId of project.employees_list) {
                    await axios.get(`http://localhost:3000/employees/projectCompleted/${employeeId}`);
                }
            }
            else if (req.params.status === "ongoing") {
                for (const employeeId of project.employees_list) {
                    await axios.get(`http://localhost:3000/employees/assignProject/${employeeId}/${req.params.project_id}`);
                }
                project.status = "ongoing";
            }
            else {
                project.status = req.params.status;
            }
            const updatedProject = await project.save();
            res.status(200).json(updatedProject);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred', error: error });
    }
}


// Set initial budget for a project
export const setProjectBudget = async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const { total_budget, employee_budget, technical_budget, additional_budget } = req.body;

    try {
        const project = await Project.findOne({ project_id });

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        // Update project budgets
        project.total_budget = total_budget;
        project.employee_budget = employee_budget;
        project.technical_budget = technical_budget;
        project.additional_budget = additional_budget;
        project.remaining_budget = total_budget - (employee_budget + technical_budget + additional_budget);

        await project.save();

        res.status(200).json({ message: 'Budget set successfully', project });
    } catch (error) {
        res.status(500).json({ error: `Error setting budget: ${error}` });
    }
};

// Get budget details for a project
export const getProjectBudget = async (req: Request, res: Response) => {
    const { project_id } = req.params;

    try {
        const project = await Project.findOne(
            { project_id },
            'total_budget remaining_budget employee_budget technical_budget additional_budget'
        );

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: `Error fetching budget: ${error}` });
    }
};

// Add an expense to the project
export const addProjectExpense = async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const { amount, category } = req.body; // category can be "employee", "technical", or "additional"

    try {
        const project = await Project.findOne({ project_id });

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        if (project.remaining_budget < amount) {
            res.status(400).json({ error: 'Insufficient remaining budget' });
            return;
        }

        // Update expenses and remaining budget
        project.remaining_budget -= amount;
        project.actual_expenses += amount;
        if (category === 'employee') {
            project.employee_expenses += amount;
        } else if (category === 'technical') {
            project.technical_expenses += amount;
        } else if (category === 'additional') {
            project.additional_expenses += amount;
        }

        await project.save();

        res.status(200).json({ message: 'Expense added successfully', project });
    } catch (error) {
        res.status(500).json({ error: `Error adding expense: ${error}` });
    }
};

// Get all expenses for a project
export const getProjectExpenses = async (req: Request, res: Response) => {
    const { project_id } = req.params;

    try {
        const project = await Project.findOne(
            { project_id },
            'employee_expenses technical_expenses additional_expenses actual_expenses remaining_budget'
        );

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: `Error fetching expenses: ${error}` });
    }
};

// Generate profit/loss report
export const getProfitLossReport = async (req: Request, res: Response) => {
    const { project_id } = req.params;

    try {
        const project = await Project.findOne({ project_id });

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        const { allocated_budget, employee_expenses, technical_expenses, additional_expenses } = project;

        // Calculate total expenses
        const total_expenses = employee_expenses + technical_expenses + additional_expenses;
        const profit_loss = allocated_budget - total_expenses;

        res.status(200).json({
            allocated_budget,
            total_expenses,
            profit_loss,
            status: profit_loss >= 0 ? 'Profit' : 'Loss'
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while generating the profit/loss report.', error });
    }
};


// Fetch monthly expenses by category
export const getMonthlyExpenses = async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const { month, year } = req.query;

    try {
        const expenses = await Project.findOne({ project_id });

        if (!expenses) {
            return res.status(404).json({ message: 'Project not found' });

        }

        // Here, you should have a mechanism to track and store monthly expenses.
        const { employee_expenses, technical_expenses, additional_expenses } = expenses;

        // Assuming you have a method to calculate monthly expenses
        const monthlyBreakdown = {
            employee: employee_expenses,   // Fetch and filter based on month/year
            technical: technical_expenses, // Fetch and filter based on month/year
            additional: additional_expenses // Fetch and filter based on month/year
        };

        res.status(200).json({
            month,
            year,
            expenses: monthlyBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching monthly expenses.', error });
    }
};


export const getMaxProjectId = async (req: Request, res: Response) => {
    console.log("Fetching max project ID");

    try {
        const maxProject = await Project.findOne({}, { project_id: 1 })
            .sort({ project_id: -1 })
            .limit(1);

        const maxId = maxProject ? maxProject.project_id : 0;

        res.status(200).json({ max_project_id: maxId });
    } catch (error) {
        console.error(`Error fetching max project_id: ${error}`);
        res.status(500).json({ error: `Error fetching maximum project_id: ${error}` });
    }
};


export const updateEmployees = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findOne({ project_id: projectId });
        //console.log(project)
        console.log("body" + JSON.stringify(req.body));
        console.log("ananthu");
        const employeeList: number[] = req.body;
        console.log("ananthu11");
        console.log("employeeList" + employeeList);
        if (!project) {
            res.status(400).json({ message: "Project not found" });
            return;
        }

        project.employees_list = employeeList;

        const List = project.employees_list;
        if (List.length == 0) {
            project.employees_list = [];
            const updatedProject = await Project.findOneAndUpdate(
                { project_id: projectId },
                project,
                { new: true, runValidators: true }  // Returns the updated document
            );

            res.status(200).json(updatedProject);
            //console.log("ananthu");
            return;
        }

        console.log("chetan");
        // Convert start_date and end_date to Date objects
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);

        // Calculate the difference in days
        const diffInTime = endDate.getTime() - startDate.getTime();
        const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
        const salary = await axios.post('http://localhost:3000/employees/calculateSalaries', {
            List
        });
        // console.log(salary);
        const employeeExpenses = salary.data.total_salary * diffInDays;
        if (project.employee_budget < employeeExpenses) {
            res.status(400).json({ message: "employee budget is exceeded" });
            return;
        }
        //console.log(project);

        const updatedProject = await Project.findOneAndUpdate(
            { project_id: projectId },
            project,
            { new: true, runValidators: true }  // Returns the updated document
        );

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating employees.", error });
    }
};