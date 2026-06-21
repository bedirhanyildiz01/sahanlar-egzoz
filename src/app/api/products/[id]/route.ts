import { NextResponse } from 'next/server';
import { getDb, products, productCarCompatibility, cars } from '@/db';
import { eq, and } from 'drizzle-orm';

// GET: Retrieve a single product by ID with compatibilities
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün ID.' }, { status: 400 });
    }

    const db = getDb();

    const productList = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (productList.length === 0) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    // Get compatible cars
    const compatibilities = await db
      .select({
        id: cars.id,
        brand: cars.brand,
        model: cars.model,
        year: cars.year,
      })
      .from(productCarCompatibility)
      .innerJoin(cars, eq(productCarCompatibility.carId, cars.id))
      .where(eq(productCarCompatibility.productId, productId));

    return NextResponse.json({
      ...productList[0],
      compatibilities,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Ürün detayı yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT: Update product details & compatibility lists (admin only)
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün ID.' }, { status: 400 });
    }

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

    // Check unique OEM code (excluding current product)
    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.oemCode, oemCode.trim()), eq(products.id, productId)))
      .limit(1);

    // If there is another product with the same OEM code
    const duplicate = await db
      .select()
      .from(products)
      .where(eq(products.oemCode, oemCode.trim()))
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== productId) {
      return NextResponse.json(
        { error: 'Bu OEM koduna sahip başka bir ürün zaten mevcut.' },
        { status: 400 }
      );
    }

    // Update Product Details
    await db
      .update(products)
      .set({
        name: name.trim(),
        description: description ? description.trim() : null,
        shnCode: shnCode.trim(),
        oemCode: oemCode.trim(),
        category,
        status,
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price.toString()) : null,
      })
      .where(eq(products.id, productId));

    // Update Compatibilities: Delete existing connections & insert new ones
    await db
      .delete(productCarCompatibility)
      .where(eq(productCarCompatibility.productId, productId));

    if (compatibilityIds && Array.isArray(compatibilityIds) && compatibilityIds.length > 0) {
      const compatibilityValues = compatibilityIds.map((carId: number) => ({
        productId,
        carId,
      }));
      await db.insert(productCarCompatibility).values(compatibilityValues);
    }

    return NextResponse.json({ success: true, message: 'Ürün güncellendi.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Ürün güncelleme işlemi başarısız: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove product (compatibilities are cascade deleted)
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün ID.' }, { status: 400 });
    }

    const db = getDb();
    const result = await db.delete(products).where(eq(products.id, productId)).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Silinecek ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ürün başarıyla silindi.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Ürün silme işlemi başarısız: ' + error.message },
      { status: 500 }
    );
  }
}
