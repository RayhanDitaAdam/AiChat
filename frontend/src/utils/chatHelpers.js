export const getTargetOwnerId = (user) => {
    if (user?.memberOf?.id) return user.memberOf.id;
    if (user?.owner?.id) return user.owner.id;
    if (user?.ownerId) return user.ownerId;
    return "11343cf4-07cd-4d2c-b91b-7f04c8ee0e7c"; // Fallback store
};

export const cleanMessage = (text) => {
    if (!text) return '';
    return text.replace(/\[FOUND\]|\[NOT_FOUND\]|\[SOP\]|\[GENERAL\]|\[ERROR\]|\[SAFE_IDS:[^\]]*\]|\[AUTO_ADD:[^\]]*\]|\[REMIND:[^\]]*\]|\[NAVIGATE:[^\]]*\]/g, '').trim();
};
