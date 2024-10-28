import { Router } from 'express';
import {
    createProject,
    getProjectById,
    getAll,
    updateProject,
    delteProject,
    getProjectsByOrgId,
    getProjectsByClientId,
    updateProjectStatus
} from '../controllers/projectController';

const router = Router();

router.get('/projects', getAll);
router.get('/projects/:id', getProjectById);
router.post('/projects', createProject);
router.put('/projects', updateProject);
router.delete('/projects/:id', delteProject);
router.get('/projects/orgs/:org_id', getProjectsByOrgId);
router.get('/projects/client/:client_id', getProjectsByClientId);
router.put('/projects/:project_id/:status', updateProjectStatus);

export default router;

