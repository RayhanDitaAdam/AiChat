export const getTargetOwnerId = (user) => {
    return user?.memberOf?.id || (user?.role === 'OWNER' ? user.ownerId : "e0449386-8bfb-4b3f-be75-6d67bd81a825");
};
