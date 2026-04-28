import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") ?? "1";

  if (!query) return NextResponse.json({ results: [] });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return NextResponse.json({ error: "Unsplash key not configured" }, { status: 500 });

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${page}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } }
  );

  if (!res.ok) return NextResponse.json({ error: "Unsplash error" }, { status: res.status });

  const data = await res.json();
  return NextResponse.json({
    results: data.results.map((img: any) => ({
      id: img.id,
      thumb: img.urls.small,
      regular: img.urls.regular,
      alt: img.alt_description ?? img.description ?? query,
      author: img.user.name,
      authorUrl: img.user.links.html,
    })),
    total: data.total,
  });
}
