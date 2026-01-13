const intermedioCompanyCoordinadorController = require("../controllers/intermedioCompanyCoordinadorController.js");
const express = require("express");

const router = express.Router();

// GET all companies assigned to a coordinator
router.get("/coordinator/:coordinadorId", (req, resp) => {
    intermedioCompanyCoordinadorController.GetCompaniesByCoordinator(req, resp);
});

// GET all coordinators assigned to a company
router.get("/company/:elementoPep", (req, resp) => {
    intermedioCompanyCoordinadorController.GetCoordinatorsByCompany(req, resp);
});

// POST create new coordinator-company assignment
router.post("/", (req, resp) => {
    intermedioCompanyCoordinadorController.PostCompanyCoordinator(req, resp);
});

// DELETE remove coordinator-company assignment
router.delete("/:id", (req, resp) => {
    intermedioCompanyCoordinadorController.DeleteCompanyCoordinator(req, resp);
});

module.exports = router;
