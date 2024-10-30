import { SelectProps } from "@cloudscape-design/components";

export const createSelectOptions = <T extends string>(
  enumObject: { [key: string]: T },
  excludeValues: T[] = [],
): SelectProps.Options => {
  const options = Object.entries(enumObject)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => !excludeValues.includes(value))
    .map(([, value]) => ({
      label: value,
      value: value,
    }));

  return options;
};
