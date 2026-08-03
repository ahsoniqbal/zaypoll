"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PostInput() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value);

    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handlePost() {
    const value = text.trim();
    if (!value) return;

    // Submit the post here
    console.log(value);

    setText("");

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  }

  return (
    <div className="flex items-end gap-2 rounded-4xl border bg-background p-2 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      <Textarea
        ref={textareaRef}
        value={text}
        rows={1}
        placeholder="Write something..."
        onChange={handleChange}
        className="min-h-9 max-h-40 resize-none overflow-y-auto border-0 px-2 py-2 shadow-none focus-visible:ring-0"
      />

      <Button
        type="button"
        size="sm"
        disabled={!text.trim()}
        onClick={handlePost}
      >
        Post
      </Button>
    </div>
  );
}
