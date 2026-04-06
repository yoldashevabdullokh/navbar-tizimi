const express = require('express');
const router = express.Router();
const {
  getQueue,
  addToQueue,
  updateStatus,
  deleteEntry,
  approveQueue,
  rejectQueue,
} = require('../controllers/queueController');

router.get('/', getQueue);
router.post('/', addToQueue);
router.patch('/:id/approve', approveQueue);
router.patch('/:id/reject', rejectQueue);
router.patch('/:id', updateStatus);
router.delete('/:id', deleteEntry);

module.exports = router;
