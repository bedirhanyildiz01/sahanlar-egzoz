import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  props: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await props.params;
    
    let bucket: R2Bucket | undefined;
    try {
      const { getCloudflareContext } = require('@opennextjs/cloudflare');
      const ctx = getCloudflareContext() as { env: { BUCKET?: R2Bucket } };
      bucket = ctx?.env?.BUCKET;
    } catch {
      // local dev fallback
    }

    if (!bucket) {
      // Local fallback: try to read from public/uploads
      try {
        const fsMod = 'fs';
        const pathMod = 'path';
        const fs = require(fsMod);
        const path = require(pathMod);
        const filePath = path.join(process.cwd(), 'public', 'uploads', key);
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          // Simple content type mapping
          let contentType = 'image/jpeg';
          if (key.endsWith('.png')) contentType = 'image/png';
          else if (key.endsWith('.webp')) contentType = 'image/webp';
          else if (key.endsWith('.svg')) contentType = 'image/svg+xml';
          
          return new Response(fileBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            }
          });
        }
      } catch {
        // Fall through to error
      }

      return NextResponse.json(
        { error: 'R2 veri deposu bağlantısı kurulmamış.' },
        { status: 500 }
      );
    }

    const object = await bucket.get(key);


    if (!object) {
      return new Response('Görsel Bulunamadı', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year

    return new Response(object.body, {
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Görsel yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
