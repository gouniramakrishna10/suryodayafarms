import React, { useRef, useEffect, useState } from 'react';
import { 
  FiBold, FiItalic, FiUnderline, FiList, 
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, 
  FiLink, FiRotateCcw, FiRotateCw, FiEye, FiEdit 
} from 'react-icons/fi';

export default function RichTextEditor({ value, onChange, placeholder = "Type description here..." }) {
  const editorRef = useRef(null);
  const [isPreview, setIsPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Sync value from prop to editor HTML ONLY when it differs to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
        updateCounts(value || '');
      }
    }
  }, [value]);

  const updateCounts = (html) => {
    // Strip HTML tags to get pure text for counting
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    
    setCharCount(text.length);
    
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateCounts(html);
    }
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
    // Return focus to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      // Basic URL verification/formatting
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = `https://${url}`;
      }
      execCmd("createLink", formattedUrl);
    }
  };

  // Setup placeholder style dynamically
  const isContentEmpty = !value || value === '<br>' || value === '<div><br></div>';

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-[#4E641A] focus-within:ring-1 focus-within:ring-[#4E641A] transition text-left">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-100 bg-[#FDFBF7] p-2 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Format buttons */}
          <button
            type="button"
            onClick={() => execCmd("bold")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Bold"
          >
            <FiBold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Italic"
          >
            <FiItalic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Underline"
          >
            <FiUnderline className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-stone-200 mx-1" />

          {/* Heading selection */}
          <select
            onChange={(e) => execCmd("formatBlock", e.target.value)}
            defaultValue="<p>"
            className="text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-md py-1 px-1.5 focus:outline-none cursor-pointer"
          >
            <option value="<p>">Paragraph</option>
            <option value="<h3>">Heading 3</option>
            <option value="<h4>">Heading 4</option>
            <option value="<h5>">Heading 5</option>
          </select>

          <span className="w-[1px] h-4 bg-stone-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Bullet List"
          >
            <FiList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer font-bold text-xs leading-none"
            style={{ width: '28px', height: '28px' }}
            title="Numbered List"
          >
            1.
          </button>

          <span className="w-[1px] h-4 bg-stone-200 mx-1" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => execCmd("justifyLeft")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Align Left"
          >
            <FiAlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyCenter")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Align Center"
          >
            <FiAlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyRight")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Align Right"
          >
            <FiAlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyFull")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Justify"
          >
            <FiAlignJustify className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-stone-200 mx-1" />

          {/* Links */}
          <button
            type="button"
            onClick={addLink}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Insert Link"
          >
            <FiLink className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-stone-200 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => execCmd("undo")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Undo"
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("redo")}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] transition border-none bg-transparent cursor-pointer"
            title="Redo"
          >
            <FiRotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border-none cursor-pointer ${
            isPreview 
              ? 'bg-[#4E641A] text-white' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE4D8] bg-transparent'
          }`}
        >
          {isPreview ? (
            <>
              <FiEdit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </>
          ) : (
            <>
              <FiEye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      <div className="relative min-h-[160px] p-4 text-xs font-normal leading-relaxed text-stone-700 select-text">
        {isPreview ? (
          <div 
            className="prose max-w-none text-left select-text"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-stone-400 italic">No content to preview.</p>' }}
          />
        ) : (
          <>
            {isContentEmpty && (
              <div className="absolute top-4 left-4 text-stone-400 select-none pointer-events-none">
                {placeholder}
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onBlur={handleInput}
              className="w-full h-full min-h-[160px] focus:outline-none select-text prose max-w-none"
              style={{ minHeight: '160px' }}
            />
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-end gap-4 border-t border-stone-100 bg-stone-50 px-4 py-2 text-[10px] text-stone-400 font-bold select-none">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>
    </div>
  );
}
