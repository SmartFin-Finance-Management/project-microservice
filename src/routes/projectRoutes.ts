import { Router } from 'express';
import {
    createProject,
    getProjectById,
    getAll,
    updateProject,
    delteProject
} from '../controllers/projectController';

const router = Router();

router.get('/projects', getAll);
router.get('/projects/:id', getProjectById);
router.post('/projects', createProject);
router.put('/projects', updateProject);
router.delete('/projects/:id', delteProject);

export default router;

