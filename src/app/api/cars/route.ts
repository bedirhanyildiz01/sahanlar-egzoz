import { NextResponse } from 'next/server';
import { getDb, cars } from '@/db';
import { and, eq, SQL } from 'drizzle-orm';

// GET: Retrieve all cars
export async function GET() {
  try {
    const db = getDb();
    const allCars = await db.select().from(cars);
    return NextResponse.json(allCars);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Araç listesi alınırken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new car compatibility mapping (checks for existing brand/model/year first)
export async function POST(req: Request) {
  try {
    const { brand, model, year } = await req.json() as { brand: string; model: string; year?: number | null };

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Marka ve model bilgisi zorunludur.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const parsedYear = year ? parseInt(year.toString(), 10) : null;

    // Check if duplicate exists
    const conditions: SQL<unknown>[] = [
      eq(cars.brand, brand.trim()),
      eq(cars.model, model.trim()),
    ];
    if (parsedYear !== null && !isNaN(parsedYear)) {
      conditions.push(eq(cars.year, parsedYear));
    }

    const existingCar = await db
      .select()
      .from(cars)
      .where(and(...conditions))
      .limit(1);

    if (existingCar.length > 0) {
      return NextResponse.json(existingCar[0], { status: 200 }); // return existing
    }

    // Insert new car compatibility entry
    const insertResult = await db
      .insert(cars)
      .values({
        brand: brand.trim(),
        model: model.trim(),
        year: parsedYear && !isNaN(parsedYear) ? parsedYear : null,
      })
      .returning();

    return NextResponse.json(insertResult[0], { status: 210 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Araç ekleme sırasında hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
