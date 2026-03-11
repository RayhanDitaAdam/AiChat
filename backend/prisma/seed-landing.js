import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Professional AiChat Landing Content...');

    // Clear existing landing data
    await prisma.landingSection.deleteMany({});

    // Global Config
    await prisma.landingPageConfig.upsert({
        where: { id: 'global' },
        update: {
            pageTitle: 'AiChat - Next-Gen AI Multi-Tenant Platform',
            themeMode: 'dark',
            floatingWhatsAppNumber: '628123456789'
        },
        create: {
            id: 'global',
            pageTitle: 'AiChat - Next-Gen AI Multi-Tenant Platform',
            themeMode: 'dark',
            floatingWhatsAppNumber: '628123456789'
        }
    });

    const sections = [
        {
            type: 'HEADER',
            title: 'Primary Navigation',
            order: 0,
            content: {
                logoText: 'AiChat',
                links: [
                    { id: 'h-1', label: 'Platform', href: '#platform' },
                    { id: 'h-2', label: 'Solutions', href: '#solutions' },
                    { id: 'h-3', label: 'Ecosystem', href: '#ecosystem' },
                    { id: 'h-4', label: 'Pricing', href: '#pricing' }
                ]
            }
        },
        {
            type: 'HERO',
            title: 'Visionary Hero',
            order: 1,
            content: {
                headline: 'Architecting Intelligent Commerce.',
                subHeadline: 'Unlock the power of Gemini 1.5 Pro to coordinate your entire retail operations. Multi-tenant, POS-synced, and ready for global scale.',
                ctaText: 'Explore Ecosystem',
                layout: 'split'
            }
        },
        {
            type: 'INTEGRATIONS',
            title: 'Ecosystem Partners',
            order: 2,
            content: {
                headline: 'Unified Ecosystem Connectivity',
                gridCols: 4,
                items: [
                    { id: 'i-1', title: 'WhatsApp Business', label: 'Communication' },
                    { id: 'i-2', title: 'Shopify Sync', label: 'E-commerce' },
                    { id: 'i-3', title: 'Google Gemini', label: 'Core Intelligence' },
                    { id: 'i-4', title: 'Cloud Postgres', label: 'Data Layer' }
                ]
            }
        },
        {
            type: 'AUDIENCE_STATS',
            title: 'Performance Metrics',
            order: 3,
            content: {
                headline: 'System Throughput & Reliability',
                subHeadline: 'Real-time metrics from our global edge infrastructure.',
                gridCols: 3,
                items: [
                    { id: 's-1', value: '450', suffix: 'ms', label: 'Avg Latency' },
                    { id: 's-2', value: '1M+', suffix: 'Msg', label: 'Daily Throughout' },
                    { id: 's-3', value: '100', suffix: '%', label: 'Data Durability' }
                ]
            }
        },
        {
            type: 'HOW_IT_WORKS',
            title: 'Integration Workflow',
            order: 4,
            content: {
                headline: '3 Steps to AI Sovereignty',
                gridCols: 3,
                items: [
                    { id: 'hw-1', title: 'Connect Data', description: 'Link your POS or database to our RAG pipeline.' },
                    { id: 'hw-2', title: 'Train Persona', description: 'Define the AI voice, boundaries, and intent rules.' },
                    { id: 'hw-3', title: 'Deploy Global', description: 'One-click publish to WhatsApp, Web, and Mobile.' }
                ]
            }
        },
        {
            type: 'FEATURES',
            title: 'Advanced Capabilities',
            order: 5,
            content: {
                headline: 'Engineered for Enterprise',
                gridCols: 3,
                items: [
                    { id: 'f-1', title: 'Neural RAG Engine', description: 'Context-aware document retrieval with sub-second accuracy.' },
                    { id: 'f-2', title: 'Tenant Isolation', description: 'Cryptographic data separation for every business client.' },
                    { id: 'f-3', title: 'Intent Blueprints', description: 'Pre-built logic for shopping, support, and sales closures.' },
                    { id: 'f-4', title: 'Human-in-the-Loop', description: 'Intelligent routing to staff for complex edge cases.' },
                    { id: 'f-5', title: 'Custom Toolsets', description: 'Let your AI execute functions like stock checks or orders.' },
                    { id: 'f-6', title: 'Vectored Analytics', description: 'Visualize customer sentiment through semantic clusters.' }
                ]
            }
        },
        {
            type: 'TERMINAL',
            title: 'Live Logic Preview',
            order: 6,
            content: {
                headline: 'Behind the Intelligence',
                subHeadline: 'Witness the semantic processing of Gemini 1.5 Pro.',
                mockMessages: [
                    { id: 'm-1', role: 'user', text: 'Cek stok kemeja flanel ukuran L.' },
                    { id: 'm-2', role: 'ai', text: '🔎 Searching inventory...\n📦 Stok tersedia: 5 pcs di Cabang Senayan.\n💰 Harga: Rp 299.000 (Potongan 10% untuk member!)' }
                ]
            }
        },
        {
            type: 'TESTIMONIALS',
            title: 'Partner Success',
            order: 7,
            content: {
                headline: 'Validated by Industry Leaders',
                gridCols: 2,
                items: [
                    { id: 'tm-1', title: 'Retail Giant CEO', description: 'AiChat reduced our support costs by 70% in just two months.' },
                    { id: 'tm-2', title: 'Logistics Founder', description: 'The POS sync is a game changer for real-time inventory tracking.' }
                ]
            }
        },
        {
            type: 'PRICING',
            title: 'Platform Tiers',
            order: 8,
            content: {
                headline: 'Predictable Strategic Scaling',
                gridCols: 3,
                items: [
                    { id: 'p-1', title: 'Startup', description: 'For small businesses starting their AI journey.' },
                    { id: 'p-2', title: 'Growth', description: 'Advanced features for scaling operations.' },
                    { id: 'p-3', title: 'Enterprise', description: 'Full architectural customization and 24/7 support.' }
                ]
            }
        },
        {
            type: 'NEWSLETTER',
            title: 'Intel Updates',
            order: 9,
            content: {
                headline: 'Stay Ahead of the Curve',
                subHeadline: 'Get weekly insights on AI-driven commerce architecture.',
                buttonText: 'Subscribe to Intel'
            }
        },
        {
            type: 'FOOTER',
            title: 'Structural Footer',
            order: 10,
            content: {
                copyright: '© 2026 AiChat Architectural Systems. Built for the future of scale.',
                links: [
                    { id: 'ft-1', label: 'Ecosystem Status', href: '/status' },
                    { id: 'ft-2', label: 'Security Whitepaper', href: '/security' },
                    { id: 'ft-3', label: 'API Documentation', href: '/docs' }
                ]
            }
        }
    ];

    for (const section of sections) {
        await prisma.landingSection.create({ data: section });
    }

    console.log('✅ Seeding Successfully Completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding Err:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
