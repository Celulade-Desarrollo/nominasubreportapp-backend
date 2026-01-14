const pool = require('./config/database');

async function addAprobadoporColumn() {
    try {
        console.log('⏳ Añadiendo columna aprobadopor a la tabla Reportes...');

        // Verificar si la columna ya existe
        const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Reportes' AND column_name='aprobadopor';
    `;

        const checkRes = await pool.query(checkQuery);

        if (checkRes.rowCount > 0) {
            console.log('⚠️ La columna aprobadopor ya existe.');
        } else {
            // Agregar la columna
            const alterQuery = `
        ALTER TABLE "Reportes" 
        ADD COLUMN "aprobadopor" bigint;
      `;
            await pool.query(alterQuery);
            console.log('✅ Columna aprobadopor agregada exitosamente.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error migrando la base de datos:', err);
        process.exit(1);
    }
}

addAprobadoporColumn();
