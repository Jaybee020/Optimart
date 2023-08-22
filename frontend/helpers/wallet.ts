export const constrictAddress = (address: string, range1 = 5, range2 = 5) => {
  return address
    ? `${address?.slice(0, range1)}...${address?.slice(-range2)}`
    : "";
};
