import { Router } from 'express'
import {
  getReservations,
  getAvailability,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getReservations)
router.get('/availability', requireAuth, getAvailability)
router.post('/', requireAuth, createReservation)
router.put('/:id', requireAuth, updateReservation)
router.delete('/:id', requireAuth, requireAdmin, deleteReservation)

export default router
