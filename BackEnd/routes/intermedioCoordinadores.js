const express = require('express');
const router = express.Router();
const controller = require('../controllers/intermedioCoordinadoresController');

// Rutas para IntermedioCoordinadores
router.get('/coordinator/:coordinadorId', controller.GetAreasByCoordinator);
router.post('/', controller.PostAreaCoordinator);
router.delete('/:id', controller.DeleteAreaCoordinator);

module.exports = router;
