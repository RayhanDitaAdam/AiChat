/**
 * Rule-based Intent Classification for Fast Chat Pipeline
 */

const intentClassification = {
    // 1. KETERSEDIAAN (AVAILABILITY) - Fokus ke nanya barangnya ada/jual atau ngga
    product_availability: {
        intent: "product_availability",
        id: [
            "ada", "ada ga", "ada ngga", "ada gak", "ada kah", "adakah", "ada kh", "masih ada", "masi ada",
            "ready", "redy", "redi", "ready ga", "ready gak", "ready kah", "ready ngab", "ready kak", "ready stock", "redy stok",
            "jual", "jual ga", "jual gak", "jual ngga", "jualan", "jual ini", "jual barang ini", "ada jual",
            "tersedia", "sedia", "nyediain", "sedia ini", "sedia ga", "apakah ada", "apakah tersedia",
            "produk", "produk ini", "barang", "barang ini", "barangnya", "barangnya ada", "item ini", "varian ini", "merk ini",
            "punya", "punya ini", "punya barang ini", "punya yg kaya gini", "ada yg kaya gini",
            "stok", "stoknya", "ada stok", "stok ada", "stoknya ready", "masih ready",
            "gak ada ya", "ngga ada ya", "gk ada ya", "bisa beli ini", "lagi nyari ini"
        ],
        en: [
            "available", "availability", "in stock", "any in stock", "stock available", "currently available",
            "have", "have this", "do you have", "got this", "do you have this",
            "sell", "sell this", "selling this", "do you sell", "carry", "do you carry", "do you stock",
            "ready", "is this ready", "ready stock", "ready to buy",
            "product", "this product", "item", "this item", "goods", "this brand", "this variant",
            "looking for this", "can i get this", "can i buy this", "have any of these"
        ]
    },

    // 2. LOKASI / POSISI (LOCATION) - Fokus ke nyari letak fisik barang di toko
    product_location: {
        intent: "product_location",
        id: [
            "mana", "dimana", "di mana", "dmn", "d mana", "sebelah mana", "sbelah mana", "arah mana",
            "rak", "di rak", "rak mana", "rak brp", "rak berapa", "deretan rak",
            "lorong", "di lorong", "lorong mana", "lorong brp", "lorong berapa", "aisle",
            "lantai", "lantai brp", "lantai berapa", "lt brp", "lt berapa",
            "posisi", "posisinya", "letak", "letaknya", "tempat", "tempatnya",
            "narohnya", "naronya", "nyimpennya", "ditaro mana",
            "area", "area mana", "bagian mana", "bgn mana", "blok mana", "deretan mana",
            "display", "display mana", "kategori ini dimana",
            "cari dimana", "carinya dmn", "nyari dmn", "nyari dimana",
            "tunjukin", "kasih tau letaknya", "bisa bantu cari", "arahin",
            "gak nemu", "gk nemu", "gak ketemu", "blm nemu", "muter muter"
        ],
        en: [
            "where", "where is", "where at", "where located", "whereabouts", "location",
            "aisle", "what aisle", "which aisle", "aisle number",
            "shelf", "what shelf", "which shelf", "shelf number", "on shelf",
            "floor", "which floor", "what floor",
            "section", "which section", "what section", "department", "which department",
            "find", "where to find", "how to find", "cant find", "cannot find",
            "placed", "where placed", "displayed", "where displayed", "spot",
            "point me to", "show me where", "navigate to", "looking for", "lost looking for"
        ]
    },

    // 3. STATUS STOK (STOCK STATUS) - Fokus ke barang yang abis, sisa, atau nanya gudang
    stock_status: {
        intent: "stock_status",
        id: [
            "habis", "abis", "habis total", "abis total", "udh abis", "udah abis", "udah habis", "hbs", "stok hbs", "stok abis",
            "kosong", "stok kosong", "stoknya kosong", "lg kosong", "lagi kosong", "kosong semua",
            "sold", "sold out", "soldout", "ludes", "kehabisan", "ga ada sisa", "gk ada sisa",
            "sisa", "sisanya", "sisa brp", "sisa berapa", "ada sisa",
            "tinggal", "tinggal brp", "tinggal berapa",
            "gudang", "cek gudang", "coba cek gudang", "di belakang", "stok di belakang", "masih ada di dalam", "stok gudang",
            "restock", "restok", "kapan restock", "kapan restok", "masuk lagi", "masuk lagi kapan", "kapan masuk",
            "ready lg kapan", "kapan ready lagi", "stok baru", "pengiriman kapan",
            "po", "pre order", "p.o", "nunggu", "nunggu brp lama"
        ],
        en: [
            "out", "out of stock", "oos", "sold out", "sold", "empty", "empty shelf",
            "nothing left", "none left", "all gone", "run out", "ran out", "depleted", "zero stock",
            "restock", "when restock", "when will it be restocked", "restock date",
            "next shipment", "next delivery", "ETA", "more stock",
            "check the back", "check inventory", "in the backroom", "warehouse", "backroom", "stock level",
            "left", "any left", "how many left", "remaining",
            "backorder", "preorder", "pre order", "waiting time"
        ]
    },

    // 4. HARGA & PROMO (PRICE & PROMO)
    price_and_promo: {
        intent: "price_and_promo",
        id: [
            "harga", "harganya", "hrg", "cek harga", "harganya dmn", "pricetag", "bandrol",
            "berapa", "brp", "harganya brp", "harganya berapa", "kena brp", "kena berapa",
            "duit", "brp duit", "berapa duit",
            "diskon", "ada diskon", "promo", "lagi promo", "promonya", "potongan", "potongan harga",
            "sale", "flash sale", "buy 1 get 1", "beli 1 gratis 1", "gratis",
            "murah", "mahal"
        ],
        en: [
            "price", "how much", "cost", "pricing", "what is the price", "check price", "price tag",
            "discount", "any discount", "promo", "promotion", "sale", "on sale",
            "bogo", "buy one get one", "clearance", "markdown", "free",
            "cheap", "expensive"
        ]
    },

    // 5. SEARCH SPECIFIC PRODUCT (With Placeholder)
    search_specific_product: {
        intent: "search_specific_product",
        id: [
            // Formal & Sopan
            "apakah di sini ada [product]?",
            "permisi, apakah menjual [product]?",
            "apakah [product] tersedia di toko ini?",
            "maaf, numpang tanya, [product] ada?",
            "bisa tolong carikan [product]?",
            "apakah di sini menyediakan [product]?",
            "saya sedang mencari [product], apakah ada?",

            // Kasual / Bahasa Sehari-hari
            "disini ada [product] ga?",
            "jual [product] ngga?",
            "[product] ada gak?",
            "[product] ready ga?",
            "lagi nyari [product] nih, ada ga?",
            "bang, ada [product]?",
            "kak, sedia [product] ga?",
            "ada jual [product] ga di sini?",
            "disini sedia [product] ya?",
            "mau beli [product], ada?",
            "kalo [product] ada ngga?",

            // Singkat & To-the-point
            "[product] ada?",
            "cari [product]",
            "beli [product]",
            "[product] ready?",
            "ada [product]?",
            "jual [product]?",
            "[product] dong",
            "punya [product]?",
            "[product] sisa ga?",

            // Slang, Typo & Singkatan (Penting buat bot Indo)
            "dsni ada [product] ga?",
            "jual [product] gk?",
            "redy [product] ga?",
            "[product] ad gk?",
            "[product] ad kh?",
            "nyari [product] dmn ya?",
            "bg ada [product]?",
            "min [product] ready?",
            "jualan [product] ga si?",
            "[product] ny ready?",
            "bs beli [product] dsni?",
            "ada [product] nggk?",
            "ad [product] ga?",
            "stok [product] masi?",
            "[product] hbs ga?",

            // Konteks Toko / Posisi langsung
            "[product] di rak mana ya?",
            "[product] taruh mana?",
            "display [product] sebelah mana?",
            "lorong buat [product] dimana?",
            "kalo mau ngambil [product] dimana?",
            "nyari [product] kok ga nemu ya, ada ga?",
            "lu taro mana sih emg"
        ],
        en: [
            // Formal
            "do you have [product] here?",
            "excuse me, do you sell [product]?",
            "is [product] available in this store?",
            "could you help me find [product]?",
            "are you currently stocking [product]?",
            "i am looking for [product], do you carry it?",

            // Casual
            "got any [product]?",
            "do you guys sell [product]?",
            "is [product] in stock?",
            "looking for [product], got any?",
            "do you carry [product]?",
            "can i buy [product] here?",

            // Short
            "[product] available?",
            "where is the [product]?",
            "need [product]",
            "any [product]?",
            "[product]?",
            "selling [product]?",

            // Store Context
            "which aisle is the [product] in?",
            "where can i find [product]?",
            "which shelf has the [product]?",
            "can't seem to find the [product], do you have it?"
        ]
    }
};

/**
 * Normalizes input text to lower case and removes extra spaces.
 * @param {string} text
 * @returns {string} Normalized string
 */
function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase().trim();
}

/**
 * Classifies intent using keyword matching against the intentClassification object.
 * @param {string} message 
 * @returns {string} Intent key like 'product_availability' or 'general_chat'
 */
function classifyIntent(message) {
    const text = normalizeText(message);

    for (const key in intentClassification) {
        const intent = intentClassification[key];
        const keywords = [...intent.id, ...intent.en];

        for (const k of keywords) {
            if (k.includes('[product]')) {
                // If it's a template, generate a regex to check if it matches
                // Escape regex special chars in the template except [product]
                const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Replace the escaped \[product\] with a wildcard capture group
                const regexStr = escapedK.replace('\\[product\\]', '(.+)');
                // Removed ^ and $ to allow matching within sentences (e.g. "Halo ada mie?")
                const regex = new RegExp(`${regexStr}`, 'i');

                if (regex.test(text)) {
                    // For the "lu taro mana sih emg" generic location intent match
                    if (k === "lu taro mana sih emg") return 'product_location';
                    return intent.intent;
                }
            } else {
                // For exact or includes matches
                if (text.includes(k)) {
                    // Normalize the new intent back to standard ones for pipeline handling
                    if (intent.intent === 'search_specific_product') {
                        // If it's asking about shelf/loc, go to product_location, otherwise availability
                        if (k.includes('rak') || k.includes('lorong') || k.includes('mana') || k.includes('dmn')) {
                            return 'product_location';
                        }
                        return 'product_availability';
                    }
                    return intent.intent;
                }
            }
        }
    }

    return 'general_chat';
}

/**
 * Extracts a product based on matching words found in the message text.
 * @param {string} message 
 * @param {Array} contextProducts Array of product objects from DB context.
 * @returns {Object|null} The matched product object or null.
 */
function extractProductName(message, contextProducts) {
    if (!contextProducts || contextProducts.length === 0) return null;
    const text = normalizeText(message);

    // Try to find the exact product name in the string
    for (const product of contextProducts) {
        const pName = normalizeText(product.name);
        // Exact match or includes
        if (text.includes(pName) || pName.includes(text.replace(/ada|ready|jual|harga/gi, '').trim())) {
            return product;
        }
    }

    // If no good match, just return the first product in context since the user is likely asking about it
    return contextProducts[0];
}

export const IntentClassifier = {
    intentClassification,
    normalizeText,
    classifyIntent,
    extractProductName
};
