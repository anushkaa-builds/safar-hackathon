import React from "react";

function parseInline(text, isUser) {
  if (!text) return null;

  // Match bold (**text** or __text__), italic (*text* or _text_), inline code (`code`)
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|(?<!\*)\*[^*]+(?<!\*)\*|__[^_]+__|(?<!_)_[^_]+(?<!_)_|\`[^`]+\`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        val: text.substring(lastIndex, match.index)
      });
    }
    const chunk = match[0];
    if ((chunk.startsWith("**") && chunk.endsWith("**")) || (chunk.startsWith("__") && chunk.endsWith("__"))) {
      parts.push({ type: "bold", val: chunk.slice(2, -2) });
    } else if ((chunk.startsWith("*") && chunk.endsWith("*")) || (chunk.startsWith("_") && chunk.endsWith("_"))) {
      parts.push({ type: "italic", val: chunk.slice(1, -1) });
    } else if (chunk.startsWith("`") && chunk.endsWith("`")) {
      parts.push({ type: "code", val: chunk.slice(1, -1) });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", val: text.substring(lastIndex) });
  }

  return parts.map((p, idx) => {
    if (p.type === "bold") {
      return (
        <strong key={idx} className={isUser ? "font-black text-white" : "font-black text-slate-950"}>
          {p.val}
        </strong>
      );
    }
    if (p.type === "italic") {
      return (
        <em key={idx} className={isUser ? "italic text-slate-200" : "italic text-slate-700 font-medium"}>
          {p.val}
        </em>
      );
    }
    if (p.type === "code") {
      return (
        <code
          key={idx}
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
            isUser ? "bg-slate-800 text-teal-300" : "bg-slate-200 text-emerald-800"
          }`}
        >
          {p.val}
        </code>
      );
    }
    return <span key={idx}>{p.val}</span>;
  });
}

export default function FormattedMessage({ content, isUser = false, isStreaming = false }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    // Headers (###, ##, #)
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="font-black text-sm text-slate-900 mt-3.5 mb-1 flex items-center gap-1.5">
          {parseInline(trimmed.slice(4), isUser)}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="font-black text-base text-slate-900 mt-4 mb-1.5">
          {parseInline(trimmed.slice(3), isUser)}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="font-black text-lg text-slate-900 mt-4 mb-2">
          {parseInline(trimmed.slice(2), isUser)}
        </h2>
      );
    }
    // Blockquotes / Warnings / Notices (> text)
    else if (trimmed.startsWith("> ")) {
      elements.push(
        <div
          key={i}
          className="p-3 my-2 rounded-xl bg-amber-50/90 border-l-4 border-amber-500 text-amber-950 text-xs font-semibold leading-relaxed shadow-2xs"
        >
          {parseInline(trimmed.slice(2), isUser)}
        </div>
      );
    }
    // Horizontal Rule (---, ***)
    else if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={i} className="my-3 border-slate-200" />);
    }
    // Numbered List Items (1. Text)
    else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const num = match ? match[1] : "•";
      const rest = match ? match[2] : trimmed;
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <span className="font-black text-emerald-700 shrink-0 text-xs mt-0.5">{num}.</span>
          <div className="flex-1">{parseInline(rest, isUser)}</div>
        </div>
      );
    }
    // Bullet List Items (- Text, * Text, • Text)
    else if (/^[-*•]\s+/.test(trimmed)) {
      const rest = trimmed.replace(/^[-*•]\s+/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
          <div className="flex-1">{parseInline(rest, isUser)}</div>
        </div>
      );
    }
    // Standard Paragraph
    else {
      elements.push(
        <p key={i} className={`my-1 text-xs sm:text-sm leading-relaxed ${isUser ? "text-white" : "text-slate-800"}`}>
          {parseInline(trimmed, isUser)}
        </p>
      );
    }
  }

  return (
    <div className="space-y-0.5">
      {elements}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-emerald-600 animate-pulse align-middle" />
      )}
    </div>
  );
}
