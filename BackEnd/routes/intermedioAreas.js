const intermedioController = require("../controllers/intermedioAreasController.js");
const express = require("express");

const router = express.Router();

// GET all intermedio records (filtrado - con coordinador si existe)
router.get("/", (req, resp) => {
    intermedioController.GetIntermedio(req, resp);
});

// GET all companies (sin filtro - TODAS las empresas con sus áreas)
router.get("/companies", (req, resp) => {
    intermedioController.GetAllCompaniesWithAreas(req, resp);
});

// GET all areas by Company ID
router.get("/company/:companyId", (req, resp) => {
    intermedioController.GetIntermedioByCompany(req, resp);
});

// GET all companies and areas for a coordinator
router.get("/coordinator/:coordinadorId/companies", (req, resp) => {
    intermedioController.GetCompaniesByCoordinatorAreas(req, resp);
});

// GET areas for a specific coordinator
router.get("/coordinator/:coordinadorId/areas", (req, resp) => {
    intermedioController.GetAreasByCoordinator(req, resp);
});

// GET intermedio by ID
router.get("/:id", (req, resp) => {
    intermedioController.GetIntermedioById(req, resp);
});

// POST create new intermedio
router.post("/", (req, resp) => {
    intermedioController.PostIntermedio(req, resp);
});

// PUT update intermedio by ID
router.put("/:id", (req, resp) => {
    intermedioController.PutIntermedioById(req, resp);
});

// DELETE intermedio by ID
router.delete("/:id", (req, resp) => {
    intermedioController.DeleteIntermedioById(req, resp);
});

module.exports = router;
