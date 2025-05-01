export const extractRent = (rentString: string) => {
  const numberPart = parseFloat(rentString.replace(/[^\d.]/g, ""));
  return rentString.toLowerCase().includes("thd")
    ? numberPart * 1000
    : numberPart;
};
