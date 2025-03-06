import { Router } from 'express';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import middlewareDefault from '~/server/middleware';
const { requireJwtAuth, generateCheckAccess } = middlewareDefault;
import { createAgent, getAgent, updateAgent, duplicateAgent, deleteAgent, getListAgents, uploadAgentAvatar } from '~/server/controllers/agents/v1';
import actions from './actions';
import tools from './tools';

const router = Router();
const avatar = Router();

const checkAgentAccess = generateCheckAccess(PermissionTypes.AGENTS, [Permissions.USE]);
const checkAgentCreate = generateCheckAccess(PermissionTypes.AGENTS, [
  Permissions.USE,
  Permissions.CREATE,
]);

const checkGlobalAgentShare = generateCheckAccess(
  PermissionTypes.AGENTS,
  [Permissions.USE, Permissions.CREATE],
  {
    [Permissions.SHARED_GLOBAL]: ['projectIds', 'removeProjectIds'],
  },
);

router.use(requireJwtAuth);
router.use(checkAgentAccess);

/**
 * Agent actions route.
 * @route GET|POST /agents/actions
 */
router.use('/actions', actions);

/**
 * Get a list of available tools for agents.
 * @route GET /agents/tools
 */
router.use('/tools', tools);

/**
 * Creates an agent.
 * @route POST /agents
 * @param {AgentCreateParams} req.body - The agent creation parameters.
 * @returns {Agent} 201 - Success response - application/json
 */
router.post('/', checkAgentCreate, createAgent);

/**
 * Retrieves an agent.
 * @route GET /agents/:id
 * @param {string} req.params.id - Agent identifier.
 * @returns {Agent} 200 - Success response - application/json
 */
router.get('/:id', checkAgentAccess, getAgent);

/**
 * Updates an agent.
 * @route PATCH /agents/:id
 * @param {string} req.params.id - Agent identifier.
 * @param {AgentUpdateParams} req.body - The agent update parameters.
 * @returns {Agent} 200 - Success response - application/json
 */
router.patch('/:id', checkGlobalAgentShare, updateAgent);

/**
 * Duplicates an agent.
 * @route POST /agents/:id/duplicate
 * @param {string} req.params.id - Agent identifier.
 * @returns {Agent} 201 - Success response - application/json
 */
router.post('/:id/duplicate', checkAgentCreate, duplicateAgent);

/**
 * Deletes an agent.
 * @route DELETE /agents/:id
 * @param {string} req.params.id - Agent identifier.
 * @returns {Agent} 200 - success response - application/json
 */
router.delete('/:id', checkAgentCreate, deleteAgent);

/**
 * Returns a list of agents.
 * @route GET /agents
 * @param {AgentListParams} req.query - The agent list parameters for pagination and sorting.
 * @returns {AgentListResponse} 200 - success response - application/json
 */
router.get('/', checkAgentAccess, getListAgents);

/**
 * Uploads and updates an avatar for a specific agent.
 * @route POST /agents/:agent_id/avatar
 * @param {string} req.params.agent_id - The ID of the agent.
 * @param {Express.Multer.File} req.file - The avatar image file.
 * @param {string} [req.body.metadata] - Optional metadata for the agent's avatar.
 * @returns {Object} 200 - success response - application/json
 */
avatar.post('/:agent_id/avatar/', checkAgentAccess, uploadAgentAvatar);

export default { v1: router, avatar };
