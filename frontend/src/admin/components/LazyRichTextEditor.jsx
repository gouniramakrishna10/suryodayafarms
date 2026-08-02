import React, { lazy, Suspense } from 'react';

const RichTextEditor = lazy(() => import('./RichTextEditor'));

export default function LazyRichTextEditor(props) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-64 bg-[#FDFBF7] border border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-3 animate-pulse text-stone-400 p-6">
          <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4E641A]">
            Loading Rich Text Editor...
          </span>
        </div>
      }
    >
      <RichTextEditor {...props} />
    </Suspense>
  );
}
