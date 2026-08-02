import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';

import { 
  FiBold, FiItalic, FiUnderline, FiList, 
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, 
  FiLink, FiImage, FiRotateCcw, FiRotateCw, FiEye, FiEdit,
  FiMaximize, FiMinimize, FiTrash2, FiCode, FiGrid, FiMinus
} from 'react-icons/fi';
import api from '../../utils/api';
import { useFeedbackStore } from '../../store/useFeedbackStore';

export default function RichTextEditor({ value, onChange, placeholder = "Write detailed product description here..." }) {
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'text-[#4E641A] underline font-medium hover:text-[#2F3B0C]',
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'rounded-2xl max-w-full my-4 shadow-sm border border-stone-200 object-contain mx-auto',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse w-full my-4 border border-stone-300 rounded-xl overflow-hidden shadow-xs',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: 'border-b border-stone-200 even:bg-stone-50/50',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-stone-300 bg-[#FCFAF5] px-4 py-2.5 text-left font-serif font-bold text-stone-850 text-xs uppercase tracking-wider',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-stone-200 px-4 py-2 text-stone-700 text-xs',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: value || '',
    onUpdate: ({ editor }) => {
      if (editor && !editor.isDestroyed) {
        const html = editor.getHTML();
        onChange(html);
      }
    },
  });

  // Sync value from prop if changed externally
  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== undefined) {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border border-stone-200 rounded-2xl p-6 bg-[#FDFBF7] text-center text-stone-400 text-xs font-semibold animate-pulse">
        Initializing Rich Text Editor...
      </div>
    );
  }

  // Count text words and characters
  const textContent = editor.getText();
  const charCount = textContent.length;
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;

  // Add Hyperlink
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return; // Cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      formattedUrl = `https://${url}`;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
  };

  // Image Upload Handler
  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      useFeedbackStore.getState().showToast('❌ Please select an image file', 'error');
      return;
    }

    setIsUploadingImage(true);
    useFeedbackStore.getState().showLoader('Uploading image to Cloudinary...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target.result;
          const res = await api.post('/auth/upload-cloudinary', {
            image: base64,
            folder: 'product-descriptions',
          });

          if (res.success && res.url) {
            editor.chain().focus().setImage({ src: res.url, alt: file.name }).run();
            useFeedbackStore.getState().showToast('✅ Image inserted into description', 'success');
          } else {
            throw new Error(res.message || 'Image upload failed');
          }
        } catch (uploadErr) {
          console.error(uploadErr);
          useFeedbackStore.getState().showToast(`❌ Upload failed: ${uploadErr.message}`, 'error');
        } finally {
          setIsUploadingImage(false);
          useFeedbackStore.getState().hideLoader();
          if (imageInputRef.current) imageInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingImage(false);
      useFeedbackStore.getState().hideLoader();
    }
  };

  const promptImageUrl = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div 
      className={`border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs transition-all text-left flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-[99999] rounded-none shadow-2xl h-screen' : 'min-h-[380px]'
      }`}
    >
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 bg-[#FDFBF7] p-2.5 select-none gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings Selector */}
          <select
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1' :
              editor.isActive('heading', { level: 2 }) ? 'h2' :
              editor.isActive('heading', { level: 3 }) ? 'h3' :
              editor.isActive('heading', { level: 4 }) ? 'h4' :
              editor.isActive('heading', { level: 5 }) ? 'h5' :
              editor.isActive('heading', { level: 6 }) ? 'h6' : 'p'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(val.replace('h', ''), 10);
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className="text-xs font-bold text-stone-700 bg-white border border-stone-250 rounded-lg py-1.5 px-2 focus:outline-none focus:border-[#4E641A] cursor-pointer shadow-2xs"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1 (H1)</option>
            <option value="h2">Heading 2 (H2)</option>
            <option value="h3">Heading 3 (H3)</option>
            <option value="h4">Heading 4 (H4)</option>
            <option value="h5">Heading 5 (H5)</option>
            <option value="h6">Heading 6 (H6)</option>
          </select>

          <span className="w-[1px] h-5 bg-stone-250 mx-1" />

          {/* Formatting: Bold, Italic, Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive('bold') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Bold (Ctrl+B)"
          >
            <FiBold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive('italic') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Italic (Ctrl+I)"
          >
            <FiItalic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive('underline') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Underline (Ctrl+U)"
          >
            <FiUnderline className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-5 bg-stone-250 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive('bulletList') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Bullet List"
          >
            <FiList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded-lg text-xs font-extrabold transition border-none cursor-pointer ${
              editor.isActive('orderedList') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            style={{ width: '28px', height: '28px' }}
            title="Numbered List"
          >
            1.
          </button>

          <span className="w-[1px] h-5 bg-stone-250 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Align Left"
          >
            <FiAlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Align Center"
          >
            <FiAlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Align Right"
          >
            <FiAlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Justify"
          >
            <FiAlignJustify className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-5 bg-stone-250 mx-1" />

          {/* Hyperlink */}
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive('link') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Insert / Edit Link"
          >
            <FiLink className="w-4 h-4" />
          </button>

          {/* Image Upload Button & Dropdown */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImage}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/60 transition border-none bg-transparent cursor-pointer flex items-center gap-1"
              title="Upload Image via Cloudinary"
            >
              <FiImage className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={promptImageUrl}
              className="text-[9px] font-bold text-[#4E641A] underline hover:text-[#2F3B0C] cursor-pointer bg-transparent border-none px-1"
              title="Insert Image URL"
            >
              URL
            </button>
          </div>

          <span className="w-[1px] h-5 bg-stone-250 mx-1" />

          {/* Tables Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`p-1.5 rounded-lg transition border-none cursor-pointer flex items-center gap-1 ${
                editor.isActive('table') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
              }`}
              title="Table Controls"
            >
              <FiGrid className="w-4 h-4" />
            </button>

            {showTableMenu && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-stone-200 rounded-xl shadow-lg p-2 min-w-[180px] text-xs font-semibold text-stone-700 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-stone-100 cursor-pointer border-none bg-transparent"
                >
                  + Insert 3x3 Table
                </button>
                {editor.isActive('table') && (
                  <>
                    <hr className="border-stone-150 my-1" />
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}
                      className="w-full text-left px-3 py-1 rounded-lg hover:bg-stone-100 cursor-pointer border-none bg-transparent"
                    >
                      Add Column
                    </button>
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}
                      className="w-full text-left px-3 py-1 rounded-lg hover:bg-stone-100 text-red-600 cursor-pointer border-none bg-transparent"
                    >
                      Delete Column
                    </button>
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}
                      className="w-full text-left px-3 py-1 rounded-lg hover:bg-stone-100 cursor-pointer border-none bg-transparent"
                    >
                      Add Row
                    </button>
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}
                      className="w-full text-left px-3 py-1 rounded-lg hover:bg-stone-100 text-red-600 cursor-pointer border-none bg-transparent"
                    >
                      Delete Row
                    </button>
                    <hr className="border-stone-150 my-1" />
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer border-none bg-transparent"
                    >
                      🗑 Delete Table
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Blockquote & Horizontal Rule & Code Block */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 rounded-lg text-xs font-bold font-serif transition border-none cursor-pointer ${
              editor.isActive('blockquote') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Block Quote"
          >
            " Quote
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/60 transition border-none bg-transparent cursor-pointer"
            title="Horizontal Divider"
          >
            <FiMinus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg transition border-none cursor-pointer ${
              editor.isActive('codeBlock') ? 'bg-[#4E641A] text-white' : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
            }`}
            title="Code Block"
          >
            <FiCode className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-5 bg-stone-250 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition border-none bg-transparent cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition border-none bg-transparent cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <FiRotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: Preview & Fullscreen */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border-none cursor-pointer ${
              isPreview 
                ? 'bg-[#4E641A] text-white' 
                : 'text-stone-700 hover:bg-stone-200/60 bg-transparent'
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

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/60 transition border-none bg-transparent cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-5 overflow-y-auto custom-scroll text-sm font-normal text-stone-800 select-text bg-white">
        {isPreview ? (
          <div className="max-w-[900px] mx-auto py-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C68A2B] mb-2 pb-1 border-b border-stone-200">
              Customer Storefront Preview
            </h4>
            <div 
              className="prose max-w-none text-left detailed-product-description"
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-stone-400 italic">No detailed description content to preview.</p>' }}
            />
          </div>
        ) : (
          <EditorContent 
            editor={editor} 
            className="w-full h-full min-h-[260px] focus:outline-none select-text prose max-w-none detailed-product-description" 
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-stone-200 bg-[#FDFBF7] px-4 py-2 text-[10px] text-stone-400 font-bold select-none shrink-0">
        <span className="text-[#4E641A]">Tiptap Rich Content Editor • Supports Word Copy/Paste</span>
        <div className="flex items-center gap-4">
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
        </div>
      </div>
    </div>
  );
}
