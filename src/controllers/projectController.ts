import { Request, response, Response } from 'express';
import Project from '../models/projectModel';
import axios from 'axios';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { project_id, org_id, client_id, project_name, start_date, end_date, status,
            total_budget, allocated_budget, remaining_budget, employee_budget,
            technical_budget, additional_budget, employee_expenses,
            technical_expenses, additional_expenses, actual_expenses, employees_list } = req.body;
        const projectData = {
            project_id, org_id, client_id, project_name, start_date, end_date, status,
            total_budget, allocated_budget, remaining_budget, employee_budget,
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
        const updatedProject = await Project.findOneAndUpdate(
            { project_id: req.params.id },
            req.body,
            { new: true, runValidators: true }  // Returns the updated document
        );

        res.status(200).json(updatedProject);
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occured' });
    }
};

export const delteProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOneAndDelete({ project_id: req.params.id }, req.body);
        if (!project)
            res.status(404).json({ message: "Project not found" });
        res.status(200).json({ message: "Project deleted Successfully!" })
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occured' });
    }
}

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
                    await axios.get(`http://localhost:3000/api/employees/projectCompleted/${employeeId}`);
                }
            }
            else if (req.params.status === "ongoing") {
                for (const employeeId of project.employees_list) {
                    await axios.get(`http://localhost:3000/api/employees/assignProject/${employeeId}/${req.params.project_id}`);
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


