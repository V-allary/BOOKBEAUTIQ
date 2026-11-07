export const MAX_SERVICES = 3;

export const isOnOffer = (s) => {
  const now = new Date();
  return Boolean(
    s.discountPrice &&
      (!s.discountStartDate || new Date(s.discountStartDate) <= now) &&
      (!s.discountEndDate || new Date(s.discountEndDate) >= now)
  );
};

export const getEffectivePrice = (s) =>
  isOnOffer(s) ? Number(s.discountPrice) : Number(s.price);

export const getTotals = (services = []) => ({
  price: services.reduce((sum, s) => sum + getEffectivePrice(s), 0),
  duration: services.reduce((sum, s) => sum + (Number(s.duration) || 0), 0),
});
