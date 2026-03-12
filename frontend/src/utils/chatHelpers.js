export const getTargetOwnerId = (user) => {
    if (user?.memberOf?.id) return user.memberOf.id;
    if (user?.owner?.id) return user.owner.id;
    if (user?.ownerId) return user.ownerId;
    return "e0449386-8bfb-4b3f-be75-6d67bd81a825"; // Fallback store
};

export const cleanMessage = (text) => {
    if (!text) return '';
    return text.replace(/\[FOUND\]|\[NOT_FOUND\]|\[SOP\]|\[GENERAL\]|\[ERROR\]|\[SAFE_IDS:[^\]]*\]|\[AUTO_ADD:[^\]]*\]|\[REMIND:[^\]]*\]|\[NAVIGATE:[^\]]*\]/g, '').trim();
};
