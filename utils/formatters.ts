import { SelectProps } from "@cloudscape-design/components";

const formatEnumLabel = (value: string): string => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const createSelectOptions = <T extends string>(
  enumObject: { [key: string]: T },
  excludeValues: T[] = [],
): SelectProps.Options => {
  const options = Object.entries(enumObject)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => !excludeValues.includes(value))
    .map(([key, value]) => ({
      label: formatEnumLabel(value),
      value: key,
    }));

  return options;
};
