const poolL = require("../config/database");

// GET all companies
function GetCompanies(req, resp) {
    const { active } = req.query;
    let query = `SELECT * FROM "Companies"`;
    let params = [];

    if (active === 'true') {
        query += ` WHERE "is_active" = true`;
    }

    query += ` ORDER BY "created_at" DESC`;

    poolL.query(
        query,
        params,
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener companies:", err);
            } else {
                resp.json(res.rows);
            }
        }
    );
}

// GET company by ID
function GetCompanyById(req, resp) {
    poolL.query(
        `SELECT * FROM "Companies" WHERE "id" = $1`,
        [req.params.id],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener company:", err);
            } else {
                resp.json(res.rows[0]);
            }
        }
    );
}

// POST create new company
function PostCompany(req, resp) {
    const { nombre_company, elemento_pep } = req.body;

    poolL.query(
        `INSERT INTO "Companies"("nombre_company", "elemento_pep") VALUES ($1, $2) RETURNING *`,
        [nombre_company, elemento_pep],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al crear company:", err);
            } else {
                resp.status(201).json(res.rows[0]);
            }
        }
    );
}

// PUT update company by ID
function PutCompanyById(req, resp) {
    const { nombre_company, elemento_pep, is_active } = req.body;
    const id = req.params.id;

    let campos = [];
    let valores = [];
    let cont = 1;

    if (nombre_company !== undefined) {
        campos.push(`"nombre_company"=$${cont++}`);
        valores.push(nombre_company);
    }
    if (elemento_pep !== undefined) {
        campos.push(`"elemento_pep"=$${cont++}`);
        valores.push(elemento_pep);
    }
    if (is_active !== undefined) {
        campos.push(`"is_active"=$${cont++}`);
        valores.push(is_active);
    }

    if (campos.length === 0) {
        resp.status(400).json({ error: "No se proporcionaron campos para actualizar" });
        return;
    }

    valores.push(id);
    const comandoSQL = `UPDATE "Companies" SET ${campos.join(", ")} WHERE "id"=$${cont} RETURNING *`;

    poolL.query(comandoSQL, valores, (err, res) => {
        if (err) {
            resp.status(err.status || 500).json({ error: err.message });
            console.error("❌ Error al actualizar company:", err);
        } else {
            resp.json(res.rows[0]);
        }
    });
}

// DELETE company by ID
function DeleteCompanyById(req, resp) {
    poolL.query(
        `DELETE FROM "Companies" WHERE "id" = $1 RETURNING *`,
        [req.params.id],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al eliminar company:", err);
            } else {
                if (res.rowCount === 0) {
                    resp.status(404).json({ error: "Company no encontrada" });
                } else {
                    resp.json({ message: "Company eliminada", deleted: res.rows[0] });
                }
            }
        }
    );
}

module.exports = { GetCompanies, GetCompanyById, PostCompany, PutCompanyById, DeleteCompanyById };
