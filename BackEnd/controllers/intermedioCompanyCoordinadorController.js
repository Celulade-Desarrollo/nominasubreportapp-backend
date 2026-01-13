const poolL = require("../config/database");

// GET all companies assigned to a specific coordinator
function GetCompaniesByCoordinator(req, resp) {
    const coordinadorDocumentoId = req.params.coordinadorId;
    
    console.log("📍 GetCompaniesByCoordinator - Obteniendo compañías del coordinador:", coordinadorDocumentoId);
    
    // Validate parameter
    if (!coordinadorDocumentoId || coordinadorDocumentoId === 'undefined') {
        console.error("❌ documento_id_coordinador no proporcionado o es undefined");
        return resp.status(400).json({ error: "documento_id_coordinador es requerido" });
    }

    poolL.query(
        `SELECT DISTINCT
      icc."id",
      icc."created_at",
      icc."elemento_pep",
      icc."documento_id_coordinador",
      c."id" as company_id,
      c."nombre_company",
      c."elemento_pep" as company_elemento_pep
    FROM "intermedio_company_coordinador" icc
    LEFT JOIN "Companies" c ON icc."elemento_pep"::text = c."elemento_pep"::text
    WHERE icc."documento_id_coordinador" = $1
    ORDER BY c."nombre_company"`,
        [coordinadorDocumentoId],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener compañías del coordinador:", err);
            } else {
                console.log("✅ Compañías del coordinador obtenidas:", res.rows.length);
                resp.json(res.rows);
            }
        }
    );
}

// GET all coordinators for a specific company
function GetCoordinatorsByCompany(req, resp) {
    const companyElementoPep = req.params.elementoPep;
    
    console.log("📍 GetCoordinatorsByCompany - Obteniendo coordinadores de:", companyElementoPep);
    
    if (!companyElementoPep || companyElementoPep === 'undefined') {
        console.error("❌ elemento_pep no proporcionado o es undefined");
        return resp.status(400).json({ error: "elemento_pep es requerido" });
    }

    poolL.query(
        `SELECT DISTINCT
      icc."id",
      icc."created_at",
      icc."elemento_pep",
      icc."documento_id_coordinador",
      u."id" as usuario_id,
      u."cedula",
      u."nombre",
      u."email"
    FROM "intermedio_company_coordinador" icc
    LEFT JOIN "Usuarios" u ON icc."documento_id_coordinador" = u."documento_id"
    WHERE icc."elemento_pep"::text = $1::text
    ORDER BY u."nombre"`,
        [companyElementoPep],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener coordinadores de la compañía:", err);
            } else {
                console.log("✅ Coordinadores de la compañía obtenidos:", res.rows.length);
                resp.json(res.rows);
            }
        }
    );
}

// POST create new coordinator-company assignment
function PostCompanyCoordinator(req, resp) {
    const { elemento_pep, documento_id_coordinador } = req.body;

    console.log("📍 PostCompanyCoordinator - Asignando compañía a coordinador:", { elemento_pep, documento_id_coordinador });

    // Validate inputs
    if (!elemento_pep || !documento_id_coordinador) {
        console.error("❌ Campos requeridos faltantes");
        return resp.status(400).json({ error: "elemento_pep y documento_id_coordinador son requeridos" });
    }

    poolL.query(
        `INSERT INTO "intermedio_company_coordinador" ("elemento_pep", "documento_id_coordinador", "created_at")
       VALUES ($1, $2, NOW())
       RETURNING *`,
        [elemento_pep, documento_id_coordinador],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al crear asignación:", err);
            } else {
                console.log("✅ Asignación creada");
                resp.status(201).json(res.rows[0]);
            }
        }
    );
}

// DELETE remove coordinator-company assignment
function DeleteCompanyCoordinator(req, resp) {
    const { id } = req.params;

    console.log("📍 DeleteCompanyCoordinator - Eliminando asignación:", id);

    poolL.query(
        `DELETE FROM "intermedio_company_coordinador" WHERE "id" = $1 RETURNING *`,
        [id],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al eliminar asignación:", err);
            } else {
                if (res.rowCount === 0) {
                    resp.status(404).json({ error: "Asignación no encontrada" });
                } else {
                    console.log("✅ Asignación eliminada");
                    resp.json({ message: "Asignación eliminada", deleted: res.rows[0] });
                }
            }
        }
    );
}

module.exports = {
    GetCompaniesByCoordinator,
    GetCoordinatorsByCompany,
    PostCompanyCoordinator,
    DeleteCompanyCoordinator
};
