const poolL = require("../config/database");

// GET all intermedio areas (sin filtro - TODAS las empresas y áreas)
function GetAllIntermedio(req, resp) {
    console.log("📍 GetAllIntermedio - Obteniendo TODAS las áreas sin filtro");

    poolL.query(
        `SELECT DISTINCT
      i."id",
      i."created_at",
      i."company_cliente",
      i."area_cliente",
      c."nombre_company",
      c."elemento_pep",
      a."nombre_area"
    FROM "IntermedioAreasEnCompany" i
    LEFT JOIN "Companies" c ON i."company_cliente"::text = c."elemento_pep"::text
    LEFT JOIN "AreasTrabajos" a ON i."area_cliente" = a."id"
    ORDER BY c."nombre_company", a."nombre_area"`,
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener todas las áreas:", err);
            } else {
                console.log("✅ Todas las áreas obtenidas:", res.rows.length);
                resp.json(res.rows);
            }
        }
    );
}

// GET all companies with their areas (sin filtro - TODAS las empresas con áreas)
function GetAllCompaniesWithAreas(req, resp) {
    console.log("📍 GetAllCompaniesWithAreas - Obteniendo TODAS las empresas con áreas activas");

    poolL.query(
        `SELECT DISTINCT
      i."id",
      i."created_at",
      i."company_cliente",
      i."area_cliente",
      c."nombre_company",
      c."elemento_pep",
      a."nombre_area"
    FROM "IntermedioAreasEnCompany" i
    LEFT JOIN "Companies" c ON i."company_cliente"::text = c."elemento_pep"::text
    LEFT JOIN "AreasTrabajos" a ON i."area_cliente" = a."id"
    WHERE c."is_active" = true
    ORDER BY c."nombre_company", a."nombre_area"`,
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener empresas con áreas:", err);
            } else {
                console.log("✅ Empresas con áreas obtenidas:", res.rows.length);
                resp.json(res.rows);
            }
        }
    );
}

// GET all intermedio areas (original - deprecated, usar GetAllIntermedio)
function GetIntermedio(req, resp) {
    poolL.query(
        `SELECT 
      i."id",
      i."created_at",
      i."company_cliente",
      i."area_cliente",
      c."nombre_company",
      a."nombre_area"
    FROM "IntermedioAreasEnCompany" i
    LEFT JOIN "Companies" c ON i."company_cliente"::text = c."elemento_pep"::text
    LEFT JOIN "AreasTrabajos" a ON i."area_cliente" = a."id"
    ORDER BY i."created_at" DESC`,
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener intermedio:", err);
            } else {
                resp.json(res.rows);
            }
        }
    );
}

// GET intermedio by ID
function GetIntermedioById(req, resp) {
    poolL.query(
        `SELECT 
      i."id",
      i."created_at",
      i."company_cliente",
      i."area_cliente",
      c."nombre_company",
      a."nombre_area"
    FROM "IntermedioAreasEnCompany" i
    LEFT JOIN "Companies" c ON i."company_cliente"::text = c."elemento_pep"::text
    LEFT JOIN "AreasTrabajos" a ON i."area_cliente" = a."id"
    WHERE i."id" = $1`,
        [req.params.id],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener intermedio:", err);
            } else {
                resp.json(res.rows[0]);
            }
        }
    );
}

// GET intermedio by Company ID (útil para obtener todas las áreas de una compañía)
function GetIntermedioByCompany(req, resp) {
    const companyId = req.params.companyId;

    console.log("📍 GetIntermedioByCompany - companyId recibido:", companyId, "tipo:", typeof companyId);

    poolL.query(
        `SELECT 
      i."id",
      i."created_at",
      i."company_cliente",
      i."area_cliente",
      c."nombre_company",
      c."elemento_pep",
      a."nombre_area"
    FROM "IntermedioAreasEnCompany" i
    LEFT JOIN "Companies" c ON i."company_cliente"::text = c."elemento_pep"::text
    LEFT JOIN "AreasTrabajos" a ON i."area_cliente" = a."id"
    WHERE i."company_cliente"::text = $1
    ORDER BY a."nombre_area"`,
        [companyId],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener intermedio por company:", err);
            } else {
                console.log("✅ Intermedio encontrado:", res.rows.length, "registros");
                resp.json(res.rows);
            }
        }
    );
}

// GET all companies and areas for a coordinator (by area)
// Obtiene todas las empresas de las áreas asignadas a un coordinador
// Relación: coordinador (documento_id) → IntermedioCoordinadores → area_encargada → IntermedioAreasEnCompany
function GetCompaniesByCoordinatorAreas(req, resp) {
    const coordinadorDocumentoId = req.params.coordinadorId;

    if (!coordinadorDocumentoId) {
        return resp.status(400).json({ error: "Se requiere el ID/documento del coordinador" });
    }

    // Obtiene todas las empresas que están en áreas gestionadas por el coordinador
    // Flujo: coordinador (documento_id) → IntermedioCoordinadores.coordinador 
    //        → area_encargada → IntermedioAreasEnCompany.area_cliente
    poolL.query(
        `SELECT DISTINCT
      i."id",
      i."created_at",
      i."company_cliente",
      i."area_cliente",
      c."nombre_company",
      c."elemento_pep",
      a."nombre_area"
    FROM "IntermedioAreasEnCompany" i
    LEFT JOIN "Companies" c ON i."company_cliente"::text = c."elemento_pep"::text
    LEFT JOIN "AreasTrabajos" a ON i."area_cliente" = a."id"
    WHERE i."area_cliente" IN (
        SELECT DISTINCT "area_encargada" 
        FROM "IntermedioCoordinadores"
        WHERE "coordinador" = $1
    )
    ORDER BY a."nombre_area", c."nombre_company"`,
        [coordinadorDocumentoId],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener empresas por coordinador:", err);
            } else {
                resp.json(res.rows);
            }
        }
    );
}

// GET areas for a coordinator (áreas asignadas)
// Retorna las áreas del campo "area_encargada" en IntermedioCoordinadores
function GetAreasByCoordinator(req, resp) {
    const coordinadorDocumentoId = req.params.coordinadorId;

    console.log("📍 GetAreasByCoordinator - coordinadorDocumentoId recibido:", coordinadorDocumentoId);

    if (!coordinadorDocumentoId || coordinadorDocumentoId === "undefined") {
        return resp.status(400).json({ error: "Se requiere el ID/documento del coordinador" });
    }

    poolL.query(
        `SELECT DISTINCT
      a."id",
      a."nombre_area",
      ic."area_encargada" as "area_cliente"
    FROM "IntermedioCoordinadores" ic
    JOIN "AreasTrabajos" a ON ic."area_encargada" = a."id"
    WHERE ic."coordinador" = $1
    ORDER BY a."nombre_area"`,
        [coordinadorDocumentoId],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener áreas del coordinador:", err);
            } else {
                console.log("✅ Áreas encontradas:", res.rows);
                resp.json(res.rows);
            }
        }
    );
}

// POST create new intermedio (asignar área a compañía)
function PostIntermedio(req, resp) {
    const { company_cliente, area_cliente } = req.body;

    poolL.query(
        `INSERT INTO "IntermedioAreasEnCompany"("company_cliente", "area_cliente") VALUES ($1, $2) RETURNING *`,
        [company_cliente, area_cliente],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al crear intermedio:", err);
            } else {
                resp.status(201).json(res.rows[0]);
            }
        }
    );
}

// PUT update intermedio by ID
function PutIntermedioById(req, resp) {
    const { company_cliente, area_cliente } = req.body;
    const id = req.params.id;

    let comandoSQL;
    let valores = [];

    if (company_cliente && area_cliente) {
        comandoSQL = `UPDATE "IntermedioAreasEnCompany" SET "company_cliente"=$1, "area_cliente"=$2 WHERE "id"=$3 RETURNING *`;
        valores = [company_cliente, area_cliente, id];
    } else if (company_cliente) {
        comandoSQL = `UPDATE "IntermedioAreasEnCompany" SET "company_cliente"=$1 WHERE "id"=$2 RETURNING *`;
        valores = [company_cliente, id];
    } else if (area_cliente) {
        comandoSQL = `UPDATE "IntermedioAreasEnCompany" SET "area_cliente"=$1 WHERE "id"=$2 RETURNING *`;
        valores = [area_cliente, id];
    } else {
        resp.status(400).json({ error: "No se proporcionaron campos para actualizar" });
        return;
    }

    poolL.query(comandoSQL, valores, (err, res) => {
        if (err) {
            resp.status(err.status || 500).json({ error: err.message });
            console.error("❌ Error al actualizar intermedio:", err);
        } else {
            resp.json(res.rows[0]);
        }
    });
}

// DELETE intermedio by ID
function DeleteIntermedioById(req, resp) {
    poolL.query(
        `DELETE FROM "IntermedioAreasEnCompany" WHERE "id" = $1 RETURNING *`,
        [req.params.id],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al eliminar intermedio:", err);
            } else {
                if (res.rowCount === 0) {
                    resp.status(404).json({ error: "Registro intermedio no encontrado" });
                } else {
                    resp.json({ message: "Registro intermedio eliminado", deleted: res.rows[0] });
                }
            }
        }
    );
}

module.exports = {
    GetIntermedio,
    GetIntermedioById,
    GetIntermedioByCompany,
    GetCompaniesByCoordinatorAreas,
    GetAreasByCoordinator,
    GetAllIntermedio,
    GetAllCompaniesWithAreas,
    PostIntermedio,
    PutIntermedioById,
    DeleteIntermedioById
};
