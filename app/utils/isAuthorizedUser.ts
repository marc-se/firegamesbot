export const isAuthorizedUser = (id: string) => {
  const USER_IDS = process.env.USER_IDS;
  if (USER_IDS) {
    const users = USER_IDS.split(",") || [];
    return users.includes(id);
  }
  return null;
};
