import { Request, Response } from 'express';
import Project from '../models/projectModel';

export const createProject = async (req: Request, res: Response) => {
    try {
        const project = new Project(req.body);
        const savedproject = await project.save();
        res.status(201).json(savedproject);
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({ project_id: req.params.id });
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project)
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
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

