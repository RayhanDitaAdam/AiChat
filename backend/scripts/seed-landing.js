import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SECTIONS = [
    {
        type: 'HERO',
        title: 'Hero Section',
        order: 1,
        content: {
            badge: 'Next-Gen Retail AI',
            headline: 'Transform Your Store with Intelligent Insights',
            subHeadline: 'Unlock the power of AI-native retail success with our comprehensive management suite.',
            ctaPrimaryText: 'Get Started',
            secondaryText: 'View Demo',
            layout: 'split'
        }
    },
    {
        type: 'TECH_STACK',
        title: 'Technology Stack',
        order: 2,
        content: {
            headline: 'Built with Modern, Enterprise-Grade Technology',
            layout: 'marquee'
        }
    },
    {
        type: 'FEATURES',
        title: 'Core Features',
        order: 3,
        content: {
            headline: 'Intelligent Retail Ecosystem',
            layout: 'grid',
            gridCols: 3,
            items: [
                { title: 'Concierge AI', description: 'Personalized shopping assistance for every customer.', icon: 'Zap' },
                { title: 'Stock Radar', description: 'Automated inventory tracking and predictive restocking.', icon: 'Shield' },
                { title: 'Live Connect', description: 'Real-time synchronization across all your store locations.', icon: 'Globe' }
            ]
        }
    },
    {
        type: 'AUDIENCE_STATS',
        title: 'Market Impact',
        order: 4,
        content: {
            headline: 'Trusted by the Best',
            layout: 'cards',
            items: [
                { value: '500', suffix: '+', label: 'Active Stores' },
                { value: '10', suffix: 'M', label: 'Transactions' },
                { value: '99', suffix: '%', label: 'Customer Satisfaction' }
            ]
        }
    },
    {
        type: 'STORE_LIST',
        title: 'Live Store Network',
        order: 5,
        content: {
            headline: 'Global Network of Intelligent Retailers',
            layout: 'marquee'
        }
    },
    {
        type: 'CTA',
        title: 'Final Call to Action',
        order: 6,
        content: {
            headline: 'Ready to Evolve?',
            subHeadline: 'Join the revolution of AI-native retail management today.',
            buttonText: 'Start Building',
            layout: 'banner'
        }
    },
    {
        type: 'FAQ',
        title: 'Frequently Asked Questions',
        order: 7,
        content: {
            sectionTitle: 'Everything you need to know',
            items: [
                { question: 'What is AI-native retail?', answer: 'It is a retail model where AI is the core foundation of operations, not just an add-on.' },
                { question: 'Is it hard to set up?', answer: 'No, our CMS-driven approach allows you to deploy in minutes.' }
            ]
        }
    }
];

async function seed() {
    console.log('🚀 Starting Landing CMS Seeding...');

    try {
        // Clear existing sections to avoid duplicates if that's intended, 
        // or just add if they don't exist. Let's clear for a fresh start.
        await prisma.landingSection.deleteMany({});
        console.log('🗑️  Cleared existing landing sections.');

        for (const section of DEFAULT_SECTIONS) {
            await prisma.landingSection.create({
                data: {
                    ...section,
                    isActive: true,
                    status: 'PUBLISHED'
                }
            });
            console.log(`✅ Created section: ${section.type}`);
        }

        // Also seed global config if missing
        const existingConfig = await prisma.landingPageConfig.findUnique({
            where: { id: 'global' }
        });

        if (!existingConfig) {
            await prisma.landingPageConfig.create({
                data: {
                    id: 'global',
                    pageTitle: 'AiChat - Premium Retail AI',
                    themeMode: 'dark',
                    maintenanceMode: false
                }
            });
            console.log('✅ Created global landing config.');
        }

        console.log('✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
