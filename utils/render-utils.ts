export const truncateString = (
  input: string,
  maxLength: number = 80
): string => {
  if (input.length <= maxLength) {
    return input;
  }

  return input.slice(0, maxLength - 3) + "...";
};
