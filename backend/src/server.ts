import 'dotenv/config';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import pg from 'pg';
import { z } from 'zod';

const config = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:4200')
}).parse(process.env);

const pool = new pg.Pool({ connectionString: config.DATABASE_URL });
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.FRONTEND_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

const productInput = z.object({
  name: z.string().trim().min(2).max(160),
  sku: z.string().trim().min(2).max(60).transform(value => value.toUpperCase()),
  category: z.enum(['Apparel', 'Accessories', 'Footwear']),
  price: z.number().finite().nonnegative(),
  stock: z.number().int().nonnegative()
}).strict();

async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      sku VARCHAR(60) NOT NULL UNIQUE,
      category VARCHAR(30) NOT NULL CHECK (category IN ('Apparel', 'Accessories', 'Footwear')),
      price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL CHECK (stock >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'atlas-ops-api', database: 'connected' });
  } catch (error) { next(error); }
});

app.get('/api/products', async (_req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id::text, name, sku, category, price::float8 AS price, stock,
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM products ORDER BY id DESC
    `);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (error) { next(error); }
});

app.post('/api/products', async (req, res, next) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid product', details: parsed.error.flatten() });
    return;
  }
  const { name, sku, category, price, stock } = parsed.data;
  try {
    const result = await pool.query(`
      INSERT INTO products (name, sku, category, price, stock)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id::text, name, sku, category, price::float8 AS price, stock,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [name, sku, category, price, stock]);
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      res.status(409).json({ error: 'SKU already exists' });
      return;
    }
    next(error);
  }
});

app.use((_req, res) => { res.status(404).json({ error: 'Route not found' }); });
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('API error:', error);
  res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

async function main(): Promise<void> {
  await initializeDatabase();
  const server = app.listen(config.PORT, () => {
    console.log(`Atlas Ops API listening at http://localhost:${config.PORT}`);
  });
  const shutdown = () => {
    server.close(() => { void pool.end().finally(() => process.exit(0)); });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(error => {
  console.error('Unable to start API:', error);
  void pool.end().finally(() => process.exit(1));
});
