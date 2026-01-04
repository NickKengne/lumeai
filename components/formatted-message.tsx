"use client"

import * as React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface FormattedMessageProps {
  content: string
  isStreaming?: boolean
}

export function FormattedMessage({ content, isStreaming = false }: FormattedMessageProps) {
  return (
    <div className="prose prose-neutral prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-neutral-900 mt-6 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-neutral-900 mt-5 mb-2.5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-neutral-800 mt-4 mb-2" {...props} />,
          
          // Paragraphs
          p: ({ node, ...props }) => <p className="text-[15px] text-neutral-700 leading-relaxed my-1.5" {...props} />,
          
          // Lists
          ul: ({ node, ...props }) => <ul className="space-y-1 ml-4 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="space-y-1 ml-4 my-2 list-decimal" {...props} />,
          li: ({ node, ...props }) => (
            <li className="text-neutral-700 text-[15px] flex items-start gap-2" {...props}>
              {props.children}
            </li>
          ),
          
          // Code
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block px-4 py-3 bg-neutral-100 text-neutral-800 rounded-lg text-sm font-mono overflow-x-auto my-2" {...props} />
            ),
          
          // Links
          a: ({ node, ...props }) => (
            <a className="text-neutral-800 underline hover:text-neutral-600" {...props} />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => <hr className="my-4 border-neutral-200" {...props} />,
          
          // Strong/Bold
          strong: ({ node, ...props }) => <strong className="font-semibold text-neutral-900" {...props} />,
          
          // Emphasis/Italic
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          
          // Blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-600 my-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1 h-4 bg-neutral-800 animate-pulse ml-1" />
      )}
    </div>
  )
}

