const poolL = require("../config/database");

// GET areas assigned to a coordinator
function GetAreasByCoordinator(req, resp) {
    const coordinadorDocumentoId = req.params.coordinadorId;

    console.log("📍 GetAreasByCoordinator - Obteniendo áreas del coordinador:", coordinadorDocumentoId);

    if (!coordinadorDocumentoId) {
        return resp.status(400).json({ error: "documento_id_coordinador es requerido" });
    }

    poolL.query(
        `SELECT DISTINCT
      ic."id",
      ic."created_at",
      ic."area_encargada",
      ic."coordinador",
      a."id" as area_id,
      a."nombre_area"
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
                console.log("✅ Áreas obtenidas:", res.rows.length);
                resp.json(res.rows);
            }
        }
    );
}

// POST assign area to coordinator
function PostAreaCoordinator(req, resp) {
    const { area_encargada, coordinador } = req.body;

    console.log("📍 PostAreaCoordinator - Asignando área a coordinador:", { area_encargada, coordinador });

    if (!area_encargada || !coordinador) {
        return resp.status(400).json({ error: "area_encargada y coordinador son requeridos" });
    }

    poolL.query(
        `INSERT INTO "IntermedioCoordinadores" ("area_encargada", "coordinador", "created_at")
       VALUES ($1, $2, NOW())
       RETURNING *`,
        [area_encargada, coordinador],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al asignar área:", err);
            } else {
                console.log("✅ Asignación creada");
                resp.status(201).json(res.rows[0]);
            }
        }
    );
}

// DELETE remove area assignment
function DeleteAreaCoordinator(req, resp) {
    const { id } = req.params;

    console.log("📍 DeleteAreaCoordinator - Eliminando asignación:", id);

    poolL.query(
        `DELETE FROM "IntermedioCoordinadores" WHERE "id" = $1 RETURNING *`,
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
    GetAreasByCoordinator,
    PostAreaCoordinator,
    DeleteAreaCoordinator
};
