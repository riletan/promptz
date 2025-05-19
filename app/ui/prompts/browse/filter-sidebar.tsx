"use client";
import { Separator } from "@/components/ui/separator";
import { QInterface } from "@/app/lib/tags-model";
import { PromptCategory } from "@/app/lib/tags-model";
import { SdlcActivity } from "@/app/lib/tags-model";
import { FilterSection } from "@/app/ui/common/filter-section";

export function FilterSidebar() {
  return (
    <div className="space-y-6">
      <FilterSection
        title="Interface"
        filterKey="tags"
        options={Object.values(QInterface)}
      />

      <Separator />

      <FilterSection
        title="Categories"
        filterKey="tags"
        options={Object.values(PromptCategory)}
        collapsible
      />

      <Separator />

      <FilterSection
        title="SDLC Activity"
        filterKey="tags"
        options={Object.values(SdlcActivity)}
        collapsible
      />
    </div>
  );
}
