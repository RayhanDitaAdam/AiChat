import prisma from "../../../common/services/prisma.service.js";

export class ProductSearchService {
  async search(query, ownerId, limit = 5) {
    const STOP_WORDS = [
      "ada",
      "apa",
      "ini",
      "itu",
      "cari",
      "temu",
      "tunjukkan",
      "lihat",
      "beli",
      "pesan",
    ];
    const keywords = query
      .toLowerCase()
      .split(/[,\s.!?]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.includes(word));

    if (keywords.length === 0) return null;

    try {
      const products = await prisma.product.findMany({
        where: {
          owner_id: ownerId,
          status: "APPROVED",
          AND: keywords.map((kw) => ({
            OR: [
              { name: { contains: kw, mode: "insensitive" } },
              { category: { contains: kw, mode: "insensitive" } },
              { description: { contains: kw, mode: "insensitive" } },
            ],
          })),
        },
        orderBy: { price: "asc" },
        take: limit,
      });

      if (products.length === 0) return null;

      const productList = products
        .map((p) => `- ${p.name} (Rp${p.price.toLocaleString()}) [ID:${p.id}]`)
        .join("\n");

      return `Berikut adalah produk yang saya temukan:\n\n${productList}\n\n[SAFE_IDS: ${products.map((p) => p.id).join(", ")}]`;
    } catch (err) {
      console.error("Product search error:", err);
      return null;
    }
  }
}
