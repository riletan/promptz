"use client";

import type * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type MentionOption = {
  value: string;
  label: string;
  description?: string;
};

const mentionOptions: MentionOption[] = [
  {
    value: "@workspace",
    label: "@workspace",
    description: "Reference your current workspace",
  },
  {
    value: "@folder",
    label: "@folder",
    description: "Reference a specific folder",
  },
  {
    value: "@file",
    label: "@file",
    description: "Reference a specific file",
  },
];

interface MentionTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
}

export function PromptTextarea({
  name,
  label,
  description,
  placeholder = "Type @ to mention...",
  className,
  ...props
}: MentionTextareaProps) {
  const form = useFormContext();
  const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [triggerPosition, setTriggerPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  // Handle textarea input to detect @ symbol
  const handleInput = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Check if the user just typed @
    if (value[cursorPos - 1] === "@") {
      setTriggerPosition(cursorPos - 1);
      setCursorPosition(cursorPos);

      // Calculate position for popover
      const cursorCoords = getCaretCoordinates(textarea, cursorPos - 1);
      setPopoverPosition({
        top: cursorCoords.top + 20,
        left: cursorCoords.left,
      });

      setMentionPopoverOpen(true);
    }
  }, []);

  // Handle selection of a mention option
  const handleSelectMention = useCallback(
    (option: MentionOption) => {
      if (
        !textareaRef.current ||
        triggerPosition === null ||
        cursorPosition === null
      )
        return;

      const textarea = textareaRef.current;
      const value = textarea.value;

      // Replace the @ with the selected mention
      const newValue =
        value.substring(0, triggerPosition) +
        option.value +
        " " +
        value.substring(cursorPosition);

      // Update the form value
      form.setValue(name, newValue, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Update cursor position
      const newCursorPos = triggerPosition + option.value.length + 1;

      // Close the popover
      setMentionPopoverOpen(false);

      // Focus back on textarea and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [form, name, triggerPosition, cursorPosition],
  );

  // Helper function to get caret coordinates
  function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
    const { offsetLeft: elementLeft, offsetTop: elementTop } = element;

    // Create a temporary element to measure
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.height = "auto";
    div.style.width = element.offsetWidth + "px";
    div.style.fontSize = window.getComputedStyle(element).fontSize;
    div.style.fontFamily = window.getComputedStyle(element).fontFamily;
    div.style.lineHeight = window.getComputedStyle(element).lineHeight;
    div.style.padding = window.getComputedStyle(element).padding;

    // Add text content up to the caret position
    div.textContent = element.value.substring(0, position);

    // Add a span at the caret position
    const span = document.createElement("span");
    span.textContent = "|";
    div.appendChild(span);

    document.body.appendChild(div);
    const { offsetLeft: spanLeft, offsetTop: spanTop } = span;
    document.body.removeChild(div);

    return {
      left: elementLeft + spanLeft,
      top: elementTop + spanTop,
    };
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Textarea
                {...field}
                {...props}
                ref={(e) => {
                  textareaRef.current = e;
                  if (typeof field.ref === "function") {
                    field.ref(e);
                  }
                }}
                placeholder={placeholder}
                className={cn("min-h-[250px] resize-y", className)}
                onInput={handleInput}
              />
              <Popover
                open={mentionPopoverOpen}
                onOpenChange={setMentionPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    ref={popoverTriggerRef}
                    variant="outline"
                    role="combobox"
                    className="absolute opacity-0 pointer-events-none"
                    style={{
                      top: popoverPosition.top,
                      left: popoverPosition.left,
                    }}
                  >
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {mentionOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => handleSelectMention(option)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(option.value)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              {option.description && (
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
