/**
 * Rule-based Intent Classification for Fast Chat Pipeline
 */

const intentClassification = {
    // 1. LOWONGAN KERJA (JOB VACANCY) - Highest Priority
    job_vacancy: {
        intent: "job_vacancy",
        // Regex patterns for flexible matching
        patterns: [
            /(ada|lagi|sedang)?\s*(buka)?\s*(loker|lowongan)/i,
            /(lagi|sedang)?\s*(hiring|recruit)/i,
            /(bisa|boleh|mau|ingin)\s*kerja\s*di\s*(sini|toko)/i
        ],
        id: [
            "loker", "info loker", "info lowongan", "lowongan",
            "lowongan kerja", "ada lowongan", "ada lowongan kerja",
            "ada loker ga", "ada loker gak", "ada loker ngga",
            "ada kerjaan", "kerjaan ada ga", "kerjaan ada gak",
            "lagi buka loker", "buka loker", "buka lowongan",
            "lagi buka lowongan", "lagi buka kerja",
            "disini ada loker", "disini ada loker ga", "di sini ada loker",
            "di toko ini ada loker", "toko ini ada loker",
            "halo ada loker", "halo kak ada loker",
            "permisi ada loker", "min ada loker",
            "kerjaan ada ga", "kerjaan ada gak",
            "ada kerjaan", "ada kerjaan ga",
            "toko ini buka loker",
            "lagi hiring", "hiring ga",
            "lagi rekrut", "lagi recruitment",
            "lagi cari karyawan", "cari karyawan",
            "cari pegawai", "butuh karyawan",
            "butuh pegawai", "butuh staff",
            "butuh orang kerja",
            "lagi cari orang", "lagi cari pegawai",
            "lagi butuh orang", "lagi butuh pegawai",
            "kerja di sini", "kerja disini",
            "bisa kerja di sini", "boleh kerja di sini",
            "mau kerja di sini", "pengen kerja di sini",
            "cara daftar kerja", "cara melamar kerja", "cara apply kerja",
            "gimana cara daftar kerja", "gimana cara melamar",
            "daftar kerja", "melamar kerja", "apply kerja",
            "kirim lamaran", "kirim cv", "kirim lamaran kerja",
            "posisi kosong", "ada posisi kosong", "posisi tersedia",
            "gabung tim", "gabung team", "join tim", "join team",
            "open recruitment", "open hiring", "open position",
            "lagi buka staff baru", "buka staff baru",
            "rekrut karyawan", "rekrut pegawai",
            "kerja part time", "kerja parttime", "kerja full time",
            "part time ada ga", "full time ada ga",
            "mau gabung kerja", "pengen gabung kerja",
            "apakah sedang buka lowongan", "apakah ada lowongan kerja",
            "toko ini lagi cari karyawan", "toko ini lagi buka loker",
            "lagi butuh pekerja", "lagi butuh staff",
            "kerja kosong", "ada kerja kosong",
            "lowongan dong", "loker dong", "info kerja dong"
        ],
        en: [
            "job vacancy", "job vacancies",
            "job opening", "job openings",
            "any vacancy", "are you hiring",
            "currently hiring", "hiring now",
            "are you recruiting", "recruiting now",
            "job available", "any job available",
            "can i work here", "i want to work here",
            "how to apply job", "how to apply",
            "job application", "apply for job",
            "send resume", "send cv",
            "join your team", "join the team",
            "looking for staff", "looking for employees",
            "need staff", "need employees",
            "position available", "open position",
            "career opportunity", "part time job", "full time job",
            "staff wanted", "employees wanted",
            "job hiring", "job recruitment"
        ]
    },

    // 2. UTILITY QUERY (TIME, DATE, WEATHER)
    utility_query: {
        intent: "utility_query",
        id: [
            // JAM
            "jam berapa", "sekarang jam berapa", "ini jam berapa",
            "jam brp", "jam brapa", "skrg jam berapa",
            "skrg jam brp", "jam sekarang", "waktu sekarang",
            "waktu skrg", "jam saat ini",
            "pukul berapa", "pukul brp",
            "udah jam berapa", "udh jam berapa",

            "min jam berapa", "kak jam berapa",
            "bang jam berapa", "gan jam berapa",

            "cek jam", "lihat jam", "liat jam",
            "tolong cek jam",
            "bisa kasih tau jam",

            // HARI
            "hari apa", "sekarang hari apa",
            "hari ini hari apa",
            "hari ini apa",

            "hari sekarang apa",
            "ini hari apa",

            "skrg hari apa",
            "skrg hari apa ya",

            "min hari apa",
            "kak hari apa",

            "hari ini senin kah",
            "hari ini selasa kah",
            "hari ini rabu kah",
            "hari ini kamis kah",
            "hari ini jumat kah",
            "hari ini sabtu kah",
            "hari ini minggu kah",

            // TANGGAL
            "tanggal berapa",
            "hari ini tanggal berapa",
            "tanggal hari ini",

            "skrg tanggal berapa",
            "tanggal sekarang",

            "hari ini tanggal",
            "cek tanggal",

            "min tanggal berapa",
            "kak tanggal berapa",

            "tanggal hari ini berapa",

            // KOMBINASI
            "hari ini tanggal berapa dan hari apa",
            "hari ini hari apa dan tanggal berapa",
            "tanggal dan hari sekarang",

            // CUACA
            "cuaca",
            "cuaca gimana",
            "cuaca hari ini",
            "cuaca sekarang",

            "cuaca di sini",
            "cuaca disini",

            "lagi hujan ga",
            "lagi hujan gak",
            "lagi hujan ngga",

            "hujan ga hari ini",
            "hari ini hujan ga",

            "panas ga hari ini",
            "panas banget ya",

            "cuaca panas",
            "cuaca dingin",

            "min cuaca gimana",
            "kak cuaca hari ini",

            "cek cuaca",
            "lihat cuaca",
            "liat cuaca",

            "cuaca di luar",
            "cuaca sekarang gimana",

            // UMUM
            "hari ini apa",
            "sekarang hari apa",
            "sekarang tanggal berapa",
            "waktu sekarang apa",
            "info waktu",
            "info hari ini"
        ],
        en: [
            // TIME
            "what time is it",
            "current time",
            "time now",
            "what's the time",
            "what time now",
            "tell me the time",
            "can you tell the time",
            "check time",
            "time please",

            // DAY
            "what day is today",
            "what day is it",
            "today is what day",
            "current day",
            "what day today",

            // DATE
            "what date is today",
            "today's date",
            "current date",
            "date today",
            "what's the date",

            // WEATHER
            "weather",
            "weather today",
            "current weather",
            "how is the weather",
            "how's the weather",
            "is it raining",
            "is it hot today",
            "weather now",
            "weather forecast",

            // COMBINED
            "date and time now",
            "what day and date today",
            "today date and day"
        ]
    },

    // 3. STATUS STOK (STOCK STATUS)
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

    // 3. LOKASI / POSISI (LOCATION)
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

    // 4. KETERSEDIAAN (AVAILABILITY)
    product_availability: {
        intent: "product_availability",
        id: [
            "ada", "ada ga", "ada gak", "ada ngga", "ada ga sih", "ada gak sih", "ada ngga sih",
            "disini ada", "di sini ada", "di toko ini ada", "toko ini ada",
            "halo ada", "halo kak ada", "permisi ada", "min ada",
            "bang ada", "gan ada", "bro ada", "sis ada",
            "ada kah", "adakah", "ada kh", "apakah ada",
            "masih ada", "masi ada", "masi ada kah",
            "masih tersedia", "apakah tersedia",
            "ready", "redy", "redi",
            "ready ga", "ready gak", "ready ngga",
            "ready ga sih", "ready gak sih",
            "ready kah", "ready kak", "ready ngab",
            "ready stok", "ready stock",
            "redy stok", "stok ready",
            "masih ready", "ready belum",
            "jual", "jual ga", "jual gak", "jual ngga",
            "jual kah", "jual ini",
            "jualan ini", "jual barang ini",
            "ada jual", "disini jual",
            "toko ini jual", "kalian jual",
            "punya", "punya ini", "punya barang ini",
            "punya yg ini", "punya yg kaya gini",
            "punya yang kayak gini",
            "punya barang ini gak",
            "punya ini ga",
            "stok", "stoknya", "stok ada",
            "ada stok", "stoknya ada",
            "stoknya ready",
            "stok masih ada",
            "barangnya ada", "barang ini ada",
            "produk ini ada",
            "item ini ada",
            "lagi nyari ini", "lagi cari ini",
            "nyari barang ini",
            "cari barang ini",
            "bisa beli ini",
            "bisa order ini",
            "bisa pesen ini",
            "bisa pesan ini",
            "ini ada ga",
            "ini ada gak",
            "ini ada ngga",
            "yang ini ada",
            "yang ini ready",
            "yang ini masih ada",
            "ada yang ini",
            "ada yg ini",
            "kalian ada ini",
            "kalian jual ini",
            "di toko ini ada gak",
            "di sini ada gak",
            "gak ada ya",
            "ngga ada ya",
            "gk ada ya",
            "barang ini ready ga",
            "produk ini ready ga",
            "min ada ini",
            "min ready ga",
            "admin ada ini",
            "bro ada ini", "gan ada ini", "kak ada ini",
            "stok barang ini ada",
            "stok barang ini ready",
            "barang ini masih ada",
            "produk ini masih ada",
            "cek stok ini",
            "cek barang ini",
            "di tempat ini ada",
            "di tempat ini jual",
            "bisa dapet ini",
            "bisa dapat ini",
            "masih jual ini",
            "masih jual barang ini",
            "ada yang kayak gini",
            "ada yg kaya gini",
            "ini ready kah",
            "ini masih ready",
            "tersedia ga",
            "tersedia gak",
            "tersedia ngga",
            "produk ini tersedia",
            "barang ini tersedia"
        ],
        en: [
            "available", "availability",
            "in stock", "any in stock",
            "stock available",
            "currently available",
            "do you have", "do you have this",
            "do you have it",
            "have this", "have this item",
            "got this", "got this item",
            "sell", "sell this",
            "do you sell",
            "do you sell this",
            "carry", "do you carry",
            "do you carry this",
            "stock", "do you stock",
            "do you stock this",
            "ready", "ready stock",
            "is this ready",
            "this product available",
            "is this product available",
            "this item available",
            "is this item available",
            "any available",
            "any left",
            "can i get this",
            "can i buy this",
            "looking for this",
            "i am looking for this",
            "is this in stock",
            "is it in stock",
            "do you still have this",
            "any stock left",
            "is this still available",
            "still selling this",
            "do you still sell this",
            "check stock",
            "is this product in stock",
            "is this item in stock",
            "available in your store",
            "do you have it in store"
        ]
    },

    // 5. HARGA & PROMO (PRICE & PROMO)
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

    // 6. SEARCH SPECIFIC PRODUCT (With Placeholder)
    search_specific_product: {
        intent: "search_specific_product",
        id: [
            "apakah di sini ada [product]?",
            "permisi, apakah menjual [product]?",
            "apakah [product] tersedia di toko ini?",
            "maaf, numpang tanya, [product] ada?",
            "bisa tolong carikan [product]?",
            "apakah di sini menyediakan [product]?",
            "saya sedang mencari [product], apakah ada?",
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
            "[product] ada?",
            "cari [product]",
            "beli [product]",
            "[product] ready?",
            "ada [product]?",
            "jual [product]?",
            "[product] dong",
            "punya [product]?",
            "[product] sisa ga?",
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
            "[product] di rak mana ya?",
            "[product] taruh mana?",
            "display [product] sebelah mana?",
            "lorong buat [product] dimana?",
            "kalo mau ngambil [product] dimana?",
            "nyari [product] kok ga nemu ya, ada ga?",
            "lu taro mana sih emg"
        ],
        en: [
            "do you have [product] here?",
            "excuse me, do you sell [product]?",
            "is [product] available in this store?",
            "could you help me find [product]?",
            "are you currently stocking [product]?",
            "i am looking for [product], do you carry it?",
            "got any [product]?",
            "do you guys sell [product]?",
            "is [product] in stock?",
            "looking for [product], got any?",
            "do you carry [product]?",
            "can i buy [product] here?",
            "[product] available?",
            "where is the [product]?",
            "need [product]",
            "any [product]?",
            "[product]?",
            "selling [product]?",
            "which aisle is the [product] in?",
            "where can i find [product]?",
            "which shelf has the [product]?",
            "can't seem to find the [product], do you have it?"
        ]
    }
};

/**
 * Normalizes input text to lower case and removes punctuation + extra spaces.
 * @param {string} text
 * @returns {string} Normalized string
 */
function normalizeText(text) {
    if (!text) return '';
    // Lowercase and remove punctuation except for spaces
    return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * Classifies intent using keyword matching and regex patterns against the intentClassification object.
 * @param {string} message 
 * @returns {string} Intent key like 'product_availability' or 'general_chat'
 */
function classifyIntent(message) {
    const text = normalizeText(message);

    for (const key in intentClassification) {
        const intent = intentClassification[key];

        // 1. Check regex patterns first (if any)
        if (intent.patterns) {
            for (const pattern of intent.patterns) {
                if (pattern.test(text)) return intent.intent;
            }
        }

        // 2. Check keyword lists
        const keywords = [...intent.id, ...intent.en];

        for (const k of keywords) {
            if (k.includes('[product]')) {
                const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexStr = escapedK.replace('\\[product\\]', '(.+)');
                const regex = new RegExp(`${regexStr}`, 'i');

                if (regex.test(text)) {
                    if (k === "lu taro mana sih emg") return 'product_location';
                    return intent.intent;
                }
            } else {
                // For exact or includes matches
                if (text.includes(k)) {
                    if (intent.intent === 'search_specific_product') {
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
 */
function extractProductName(message, contextProducts) {
    if (!contextProducts || contextProducts.length === 0) return null;
    const text = normalizeText(message);

    for (const product of contextProducts) {
        const pName = normalizeText(product.name);
        // Exact match or includes
        if (text.includes(pName) || pName.includes(text.replace(/ada|ready|jual|harga/gi, '').trim())) {
            return product;
        }
    }

    // Return null if no good match found, allowing the pipeline to handle the "not found" case
    return null;
}

export const IntentClassifier = {
    intentClassification,
    normalizeText,
    classifyIntent,
    extractProductName
};
