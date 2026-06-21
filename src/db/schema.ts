import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  shnCode: text('shn_code').notNull(),
  oemCode: text('oem_code').notNull().unique(),
  category: text('category').notNull(), // Susturucu, Katalizör, Manifold, vb.
  status: text('status').notNull(),     // Aktif, Pasif, Sıfır, İkinci El, Revizyonlu, vb.
  imageUrl: text('image_url'),
  price: real('price'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const cars = sqliteTable('cars', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  brand: text('brand').notNull(),       // Örn: Renault, Tofaş, BMW
  model: text('model').notNull(),       // Örn: Megane 4, Şahin, E46
  year: integer('year'),                // Opsiyonel üretim yılı
});

export const productCarCompatibility = sqliteTable('product_car_compatibility', {
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  carId: integer('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.productId, t.carId] }),
}));

// Setup relations for Drizzle Relational Queries
export const productsRelations = relations(products, ({ many }) => ({
  compatibilities: many(productCarCompatibility),
}));

export const carsRelations = relations(cars, ({ many }) => ({
  compatibilities: many(productCarCompatibility),
}));

export const productCarCompatibilityRelations = relations(productCarCompatibility, ({ one }) => ({
  product: one(products, {
    fields: [productCarCompatibility.productId],
    references: [products.id],
  }),
  car: one(cars, {
    fields: [productCarCompatibility.carId],
    references: [cars.id],
  }),
}));
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
