"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  STYLE_CATEGORIES,
  filterTagsByProvider,
  formatStylePrefix,
} from "@/lib/tts-tags";

interface UseStyleTagsArgs {
  selectedProviderId: string;
  text: string;
  setText: (next: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const STYLE_PREFIX_REGEX = /^\([^)]*\)\s*/;

/**
 * Manages the multi-select style-tag list, the free-text custom input, and
 * the side effect of rewriting the leading `(tag1 tag2)` prefix on the
 * textarea whenever the selection changes.
 */
export default function useStyleTags({
  selectedProviderId,
  text,
  setText,
  textareaRef,
}: UseStyleTagsArgs) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [customStyleInput, setCustomStyleInput] = useState("");

  // Read the *latest* selectedProviderId inside toggleStyleTag without
  // re-creating the callback (which would re-trigger effects).
  const providerIdRef = useRef(selectedProviderId);
  useEffect(() => {
    providerIdRef.current = selectedProviderId;
  }, [selectedProviderId]);

  const filteredCategories = useMemo(
    () =>
      STYLE_CATEGORIES.map((cat) => ({
        ...cat,
        tags: filterTagsByProvider(cat.tags, selectedProviderId),
      })).filter((cat) => cat.tags.length > 0),
    [selectedProviderId],
  );

  const toggleStyleTag = useCallback(
    (tag: string) => {
      setSelectedStyles((prev) => {
        const next = prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag];

        const prefix = formatStylePrefix(next, providerIdRef.current);
        setText(
          STYLE_PREFIX_REGEX.test(text)
            ? text.replace(STYLE_PREFIX_REGEX, prefix)
            : `${prefix}${text}`,
        );

        return next;
      });
      textareaRef.current?.focus();
    },
    [setText, text, textareaRef],
  );

  const addCustomStyle = useCallback(() => {
    const tag = customStyleInput.trim();
    if (!tag) return;
    toggleStyleTag(tag);
    setCustomStyleInput("");
  }, [customStyleInput, toggleStyleTag]);

  const clearStyles = useCallback(() => {
    setSelectedStyles([]);
  }, []);

  return {
    selectedStyles,
    customStyleInput,
    setCustomStyleInput,
    filteredCategories,
    toggleStyleTag,
    addCustomStyle,
    clearStyles,
  };
}
