import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Yüklenecek dosya bulunamadı.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a safe, unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${timestamp}-${safeName}`;

    // 1. Cloudflare R2 Upload (if binding is active via getCloudflareContext)
    let bucket: R2Bucket | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCloudflareContext } = require('@opennextjs/cloudflare');
      const ctx = getCloudflareContext() as { env: { BUCKET?: R2Bucket } };
      bucket = ctx?.env?.BUCKET;
    } catch {
      // Not on Cloudflare — fall through to local dev
    }

    if (bucket) {
      await bucket.put(key, buffer, {
        httpMetadata: { contentType: file.type },
      });
      return NextResponse.json({ url: `/api/images/${key}` });
    }

    // 2. Local Fallback for local Next.js development (Node runtime)
    // Using string construction for require to hide it from build-time Edge compilers
    try {
      const fsMod = 'fs';
      const pathMod = 'path';
      const fs = require(fsMod);
      const path = require(pathMod);

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDir, key), buffer);
      return NextResponse.json({ url: `/uploads/${key}` });
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Yerel dosya sistemi erişim hatası: ' + e.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Görsel yükleme sırasında hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
