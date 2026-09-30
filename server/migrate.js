import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const databaseName = process.env.DB_NAME || 'hello_world';
if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  console.error('DB_NAME may contain only letters, numbers, and underscores.');
  process.exit(1);
}

let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  await connection.query(`USE \`${databaseName}\``);
  const schemaPath = fileURLToPath(new URL('../database/schema.sql', import.meta.url));
  const schema = await readFile(schemaPath, 'utf8');
  const tableDefinitions = schema.replace(/^CREATE DATABASE IF NOT EXISTS[\s\S]*?;\s*USE hello_world;\s*/i, '');
  if (tableDefinitions === schema) throw new Error('The schema database header could not be validated.');
  await connection.query(tableDefinitions);
  console.log(`Database schema applied to ${databaseName}.`);
} catch {
  console.error('Database migration failed. Check MySQL availability, permissions, and DB_* values.');
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
