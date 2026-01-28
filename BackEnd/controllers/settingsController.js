const poolL = require("../config/database");

// GET all settings
function GetAllSettings(req, resp) {
    poolL.query(
        `SELECT "key", "value", "description" FROM "SystemSettings"`,
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener settings:", err);
            } else {
                // Convert array to object for easier consumption
                const settings = {};
                res.rows.forEach(row => {
                    settings[row.key] = row.value;
                });
                resp.json(settings);
            }
        }
    );
}

// GET setting by key
function GetSettingByKey(req, resp) {
    poolL.query(
        `SELECT "value" FROM "SystemSettings" WHERE "key" = $1`,
        [req.params.key],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al obtener setting:", err);
            } else {
                if (res.rows.length > 0) {
                    resp.json(res.rows[0].value);
                } else {
                    resp.status(404).json({ error: "Setting no encontrado" });
                }
            }
        }
    );
}

// PUT update setting
function PutSetting(req, resp) {
    const { key, value } = req.body;

    if (!key || value === undefined) {
        return resp.status(400).json({ error: "Key y value son requeridos" });
    }

    poolL.query(
        `UPDATE "SystemSettings" SET "value" = $2, "updated_at" = NOW() WHERE "key" = $1 RETURNING *`,
        [key, value],
        (err, res) => {
            if (err) {
                resp.status(err.status || 500).json({ error: err.message });
                console.error("❌ Error al actualizar setting:", err);
            } else {
                if (res.rowCount === 0) {
                    // Try to insert if it doesn't exist? (Optional, following strict pattern for now)
                    resp.status(404).json({ error: "Setting no encontrado" });
                } else {
                    resp.json(res.rows[0]);
                }
            }
        }
    );
}

module.exports = { GetAllSettings, GetSettingByKey, PutSetting };
