import * as React from "react";
import { useState, useRef, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { TagIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const SidebarSearch = ({ onSearch, onFilterTags, allTags = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [contentHeight, setContentHeight] = useState(0);
  const tagsRef = useRef(null);

  // Measure content height
  useLayoutEffect(() => {
    if (tagsRef.current) {
      const height = tagsRef.current.scrollHeight;
      setContentHeight(Math.min(height + 16, 192)); // 192px = 12rem (max-height)
    }
  }, [allTags]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value, selectedTags);
  };

  const toggleTag = (tagValue) => {
    const newSelectedTags = selectedTags.includes(tagValue)
      ? selectedTags.filter((t) => t !== tagValue)
      : [...selectedTags, tagValue];

    setSelectedTags(newSelectedTags);
    onFilterTags(newSelectedTags);
    onSearch(searchTerm, newSelectedTags);
  };

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      <Input
        type="search"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-8 text-sm min-w-0"
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "h-8 w-8 inline-flex items-center justify-center rounded-md border text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selectedTags.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
            )}
            aria-label="Filter by tags"
          >
            <TagIcon className="h-4 w-4" />
            {selectedTags.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-primary">
                {selectedTags.length}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-2"
          align="end"
          style={{
            height: contentHeight ? `${contentHeight}px` : "auto",
          }}
        >
          <ScrollArea
            className={cn(
              "w-full",
              contentHeight >= 192 ? "h-44" : "h-full", // 44 = 11rem (accounting for padding)
            )}
          >
            <div ref={tagsRef} className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <Badge
                  key={tag.value}
                  variant={tag.variant}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTags.includes(tag.value) &&
                      "ring-2 ring-ring ring-offset-1",
                    tag.variant === "default" && "hover:bg-primary/90",
                    tag.variant === "outline" &&
                      "hover:bg-accent hover:text-accent-foreground",
                    tag.variant === "destructive" && "hover:bg-destructive/90",
                  )}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.label}
                  {selectedTags.includes(tag.value) && (
                    <XIcon
                      className="ml-1 h-3 w-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag.value);
                      }}
                    />
                  )}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SidebarSearch;
