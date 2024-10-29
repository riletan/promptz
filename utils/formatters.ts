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
  const options = Object.values(enumObject)
    .filter((value) => !excludeValues.includes(value))
    .map((value) => ({
      label: formatEnumLabel(value),
      value: value,
    }));

  return options;
};
