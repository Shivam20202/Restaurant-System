import { Router } from 'express'
import { getAllTables, createTable, updateTable, deleteTable } from '../controllers/tableController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getAllTables)
router.post('/', requireAuth, requireAdmin, createTable)
router.put('/:id', requireAuth, requireAdmin, updateTable)
router.delete('/:id', requireAuth, requireAdmin, deleteTable)

export default router
