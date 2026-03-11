import { prisma } from '../../common/services/prisma.service.js';
import { SectionStatus } from '@prisma/client';

export class LandingService {
    // Public only sees PUBLISHED sections
    async getPublicSections() {
        return await prisma.landingSection.findMany({
            where: { status: SectionStatus.PUBLISHED, isActive: true },
            orderBy: { order: 'asc' }
        });
    }

    // Admin sees current working version (DRAFT if exists, otherwise PUBLISHED)
    async getAdminSections() {
        const published = await prisma.landingSection.findMany({
            where: { status: SectionStatus.PUBLISHED },
            orderBy: { order: 'asc' }
        });

        const drafts = await prisma.landingSection.findMany({
            where: { status: SectionStatus.DRAFT }
        });

        // Merge: If a DRAFT exists for a PUBLISHED section (via parentId), use the DRAFT
        return published.map(p => {
            const draft = drafts.find(d => d.parentId === p.id);
            return draft ? { ...draft, id: p.id, realDraftId: draft.id } : p;
        });
    }

    async createSection(data) {
        // New sections start as PUBLISHED for simplicity if created via CMS "Add"
        // Or we can start as DRAFT. Let's start as PUBLISHED so it's immediately visible.
        return await prisma.landingSection.create({
            data: {
                ...data,
                status: SectionStatus.PUBLISHED,
                order: data.order ?? 0
            }
        });
    }

    async saveDraft(id, data) {
        // id here is the PUBLISHED section ID
        const publishedSection = await prisma.landingSection.findUnique({ where: { id } });
        if (!publishedSection) throw new Error('Original section not found');

        // Check if DRAFT already exists
        const existingDraft = await prisma.landingSection.findFirst({
            where: { parentId: id, status: SectionStatus.DRAFT }
        });

        if (existingDraft) {
            return await prisma.landingSection.update({
                where: { id: existingDraft.id },
                data: {
                    title: data.title ?? existingDraft.title,
                    subtitle: data.subtitle ?? existingDraft.subtitle,
                    content: data.content ?? existingDraft.content,
                    isActive: data.isActive ?? existingDraft.isActive,
                    order: data.order ?? existingDraft.order
                }
            });
        } else {
            return await prisma.landingSection.create({
                data: {
                    type: publishedSection.type,
                    title: data.title ?? publishedSection.title,
                    subtitle: data.subtitle ?? publishedSection.subtitle,
                    content: data.content ?? publishedSection.content,
                    order: publishedSection.order,
                    isActive: data.isActive ?? publishedSection.isActive,
                    status: SectionStatus.DRAFT,
                    parentId: id
                }
            });
        }
    }

    async publishAllDrafts() {
        const drafts = await prisma.landingSection.findMany({
            where: { status: SectionStatus.DRAFT }
        });

        return await prisma.$transaction(async (tx) => {
            for (const draft of drafts) {
                const parentId = draft.parentId;

                // 1. Move current PUBLISHED to REVISION
                await tx.landingSection.update({
                    where: { id: parentId },
                    data: { status: SectionStatus.REVISION }
                });

                // 2. Clear old parentId/id references and make this DRAFT the new PUBLISHED
                await tx.landingSection.update({
                    where: { id: draft.id },
                    data: {
                        id: parentId, // Swap ID back to original to keep frontend stable
                        status: SectionStatus.PUBLISHED,
                        parentId: null
                    }
                });

                // Note: Prisma might complain about ID swap if not careful. 
                // Alternative: Update PUBLISHED with DRAFT values, then delete DRAFT.
            }
        });
    }

    // Safer Publish implementation
    async publishSection(publishedId) {
        const draft = await prisma.landingSection.findFirst({
            where: { parentId: publishedId, status: SectionStatus.DRAFT }
        });
        if (!draft) return;

        return await prisma.$transaction([
            // Create a REVISION from current PUBLISHED
            prisma.landingSection.create({
                data: {
                    ...(await prisma.landingSection.findUnique({ where: { id: publishedId } })),
                    id: undefined, // let it auto-gen
                    status: SectionStatus.REVISION,
                    parentId: publishedId
                }
            }),
            // Update PUBLISHED with DRAFT data
            prisma.landingSection.update({
                where: { id: publishedId },
                data: {
                    title: draft.title,
                    subtitle: draft.subtitle,
                    content: draft.content,
                    isActive: draft.isActive,
                    order: draft.order
                }
            }),
            // Delete the DRAFT
            prisma.landingSection.delete({ where: { id: draft.id } })
        ]);
    }

    async getRevisionHistory(parentId) {
        return await prisma.landingSection.findMany({
            where: { parentId, status: SectionStatus.REVISION },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }

    async restoreRevision(revisionId) {
        const revision = await prisma.landingSection.findUnique({ where: { id: revisionId } });
        if (!revision || revision.status !== SectionStatus.REVISION) throw new Error('Invalid revision');

        return await this.saveDraft(revision.parentId, {
            title: revision.title,
            subtitle: revision.subtitle,
            content: revision.content,
            isActive: revision.isActive
        });
    }

    async deleteSection(id) {
        return await prisma.landingSection.deleteMany({
            where: { OR: [{ id }, { parentId: id }] }
        });
    }

    async reorderSections(reorderData) {
        return await prisma.$transaction(
            reorderData.map(item =>
                prisma.landingSection.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );
    }

    async getPageConfig() {
        return await prisma.landingPageConfig.findUnique({
            where: { id: 'global' }
        }) || await prisma.landingPageConfig.create({
            data: { id: 'global' }
        });
    }

    async updatePageConfig(data) {
        return await prisma.landingPageConfig.upsert({
            where: { id: 'global' },
            update: data,
            create: { ...data, id: 'global' }
        });
    }

    async generatePreviewToken() {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = new Date(Date.now() + 3600000); // 1 hour
        await prisma.landingPageConfig.update({
            where: { id: 'global' },
            data: { previewToken: token, previewTokenExpires: expires }
        });
        return token;
    }

    async validatePreviewToken(token) {
        const config = await prisma.landingPageConfig.findUnique({ where: { id: 'global' } });
        if (!config || config.previewToken !== token) return false;
        if (config.previewTokenExpires && config.previewTokenExpires < new Date()) return false;
        return true;
    }
}
