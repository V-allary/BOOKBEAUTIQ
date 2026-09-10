export function getActiveDiscount(service) {
    if (!service.discountPrice) return null;
  
    const now = new Date();
  
    if (service.discountStartDate && new Date(service.discountStartDate) > now) return null;
    if (service.discountEndDate && new Date(service.discountEndDate) < now) return null;
  
    return {
      originalPrice: service.price,
      discountPrice: service.discountPrice,
      label: service.discountLabel || "Special Offer",
    };
  }
  