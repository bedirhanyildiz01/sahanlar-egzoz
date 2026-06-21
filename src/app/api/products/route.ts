import { NextResponse } from 'next/server';
import { getDb, products, productCarCompatibility, cars } from '@/db';
import { eq, like, or, and, inArray, SQL } from 'drizzle-orm';

// GET: Filtered products list
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const status = searchParams.get('status');

    const db = getDb();

    // Start building query
    let query = db
      .selectDistinct({
        id: products.id,
        name: products.name,
        description: products.description,
        shnCode: products.shnCode,
        oemCode: products.oemCode,
        category: products.category,
        status: products.status,
        imageUrl: products.imageUrl,
        price: products.price,
        createdAt: products.createdAt,
      })
      .from(products);

    const conditions: SQL<unknown>[] = [];

    if (category && category !== 'all') {
      conditions.push(eq(products.category, category));
    }
    if (status && status !== 'all') {
      conditions.push(eq(products.status, status));
    }
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(products.name, searchPattern),
          like(products.shnCode, searchPattern),
          like(products.oemCode, searchPattern)
        )!
      );
    }

    // Join tables if brand or model filter is active
    if ((brand && brand !== 'all') || (model && model !== 'all')) {
      query = query
        .innerJoin(productCarCompatibility, eq(products.id, productCarCompatibility.productId))
        .innerJoin(cars, eq(productCarCompatibility.carId, cars.id)) as any;

      if (brand && brand !== 'all') {
        conditions.push(eq(cars.brand, brand));
      }
      if (model && model !== 'all') {
        conditions.push(eq(cars.model, model));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const fetchedProducts = await query;

    // Load compatibilities in one batch query to optimize performance
    const productIds = fetchedProducts.map((p: any) => p.id);
    const productMap = fetchedProducts.map((p: any) => ({ ...p, compatibilities: [] as any[] }));

    if (productIds.length > 0) {
      const allCompatibilities = await db
        .select({
          productId: productCarCompatibility.productId,
          car: {
            id: cars.id,
            brand: cars.brand,
            model: cars.model,
            year: cars.year,
          },
        })
        .from(productCarCompatibility)
        .innerJoin(cars, eq(productCarCompatibility.carId, cars.id))
        .where(inArray(productCarCompatibility.productId, productIds));

      // Map compatibilities back to products
      const compatibilityGroup: Record<number, any[]> = {};
      allCompatibilities.forEach((item: any) => {
        if (!compatibilityGroup[item.productId]) {
          compatibilityGroup[item.productId] = [];
        }
        compatibilityGroup[item.productId].push(item.car);
      });

      productMap.forEach((p: any) => {
        p.compatibilities = compatibilityGroup[p.id] || [];
      });
    }

    return NextResponse.json(productMap);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Ürünler yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new product (admin only, verified via route check or server component)
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      name: string; description?: string; shnCode: string; oemCode: string;
      category: string; status: string; imageUrl?: string; price?: number;
      compatibilityIds?: number[];
    };
    const {
      name,
      description,
      shnCode,
      oemCode,
      category,
      status,
      imageUrl,
      price,
      compatibilityIds, // array of car IDs
    } = body;

    if (!name || !shnCode || !oemCode || !category || !status) {
      return NextResponse.json(
        { error: 'Eksik ürün bilgisi. Lütfen zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check unique OEM code
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.oemCode, oemCode.trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Bu OEM koduna sahip başka bir ürün zaten mevcut.' },
        { status: 400 }
      );
    }

    // Insert Product
    const insertResult = await db
      .insert(products)
      .values({
        name: name.trim(),
        description: description ? description.trim() : null,
        shnCode: shnCode.trim(),
        oemCode: oemCode.trim(),
        category: category,
        status: status,
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price.toString()) : null,
      })
      .returning();

    const newProduct = insertResult[0];

    // Insert Car Compatibilities
    if (compatibilityIds && Array.isArray(compatibilityIds) && compatibilityIds.length > 0) {
      const compatibilityValues = compatibilityIds.map((carId: number) => ({
        productId: newProduct.id,
        carId: carId,
      }));
      await db.insert(productCarCompatibility).values(compatibilityValues);
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Ürün ekleme işlemi başarısız: ' + error.message },
      { status: 500 }
    );
  }
}
