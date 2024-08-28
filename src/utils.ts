export const calculateDiscount = (price: number, percentage: number) => {
    // 100,10 // look we export calculateDiscount
    return price * (percentage / 100); // 100*(10/100) = 10
};
