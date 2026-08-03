import { Client } from 'pg';

/**
 * Creates the application database if it does not exist yet, so the API can
 * boot before `prisma migrate` has been run. Connects to the `postgres`
 * maintenance database on the same server and runs `CREATE DATABASE` when
 * the target database is missing. Requires CREATEDB privileges.
 *
 * Returns `true` when the database was just created (callers can use this to
 * decide whether to also apply the schema).
 */
export async function ensureDatabaseExists(): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const url = new URL(databaseUrl);
  const dbName = decodeURIComponent(url.pathname.slice(1));
  if (!dbName || dbName === 'postgres') {
    return false;
  }

  // Point at the maintenance database on the same server (keeps credentials
  // and host), dropping any Prisma query params pg does not understand.
  const maintenanceUrl = new URL(url);
  maintenanceUrl.pathname = '/postgres';
  maintenanceUrl.search = '';

  const client = new Client({ connectionString: maintenanceUrl.toString() });
  try {
    await client.connect();
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName],
    );
    if (!rowCount) {
      const escaped = dbName.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${escaped}"`);
      console.log(`Created database "${dbName}"`);
      return true;
    }
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}
