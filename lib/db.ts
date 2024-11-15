// lib/db.ts
import mysql from 'mysql2/promise';

// Crear la conexión dinámica utilizando la configuración recibida
export const createDynamicConnection = async (dbConfig: { host: string, user: string, password: string, database: string }) => {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    });
    return connection;
};