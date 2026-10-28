"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight rich-text editor (contentEditable + execCommand), no deps.
// Emits HTML into a hidden input named `name`.
export function RichText({ name, initial = "" }: { name: string; initial?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initial);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== initial) ref.current.innerHTML = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (ref.current) setHtml(ref.current.innerHTML);
  };

  const sync = () => { if (ref.current) setHtml(ref.current.innerHTML); };

  return (
    <div className="rte">
      <div className="rte-bar">
        <button type="button" onClick={() => exec("bold")} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => exec("italic")} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => exec("formatBlock", "h3")} title="Heading">H</button>
        <button type="button" onClick={() => exec("insertUnorderedList")} title="Bullet list">• List</button>
        <button type="button" onClick={() => exec("insertOrderedList")} title="Numbered list">1. List</button>
        <button type="button" onClick={() => { const u = prompt("Link URL:"); if (u) exec("createLink", u); }} title="Link">Link</button>
        <button type="button" onClick={() => exec("removeFormat")} title="Clear">Clear</button>
      </div>
      <div
        ref={ref}
        className="rte-area"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
      />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
