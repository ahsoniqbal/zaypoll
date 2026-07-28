import mysql from 'mysql2/promise';

const configuredPort = Number(process.env.DB_PORT ?? 3306);

if (!Number.isInteger(configuredPort) || configuredPort <= 0 || configuredPort > 65535) {
    throw new Error("DB_PORT must be a valid TCP port");
}

const useSsl = process.env.DB_SSL === "true";
const caCertificate = process.env.DB_CA_CERT?.replace(/\\n/g, "\n").trim();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: configuredPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useSsl
        ? {
            ca: caCertificate || undefined,
            rejectUnauthorized: true,
        }
        : undefined,
    connectionLimit: 10,
    timezone: 'Z',
});

pool.pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
});

export default pool;
