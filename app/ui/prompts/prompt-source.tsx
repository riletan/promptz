import { Link as LinkIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import Link from "next/link";

interface PromptSourceProps {
  url: string;
}

export function PromptSource({ url }: PromptSourceProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-neutral-400">Source:</Label>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
      >
        <LinkIcon className="h-4 w-4" />
        {url}
      </Link>
    </div>
  );
}
