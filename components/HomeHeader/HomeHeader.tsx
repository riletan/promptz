"use client";
import "./styles.modules.css";
import { Box, Input } from "@cloudscape-design/components";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <Box textAlign="center" margin={"xl"}>
      <h1>Simplify prompting for Amazon Q Developer</h1>
      <h2>The perfect prompt is just one click away!</h2>
      <Input
        data-testing="search-input"
        onChange={({ detail }) => setSearchQuery(detail.value)}
        type="search"
        inputMode="search"
        autoFocus
        placeholder="Enter your search term and click enter."
        value={searchQuery}
        onKeyUp={({ detail }) => {
          if (detail.keyCode === 13) {
            router.push(`/browse?query=${searchQuery}`);
          }
        }}
      />
    </Box>
  );
}
