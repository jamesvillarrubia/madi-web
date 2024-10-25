import ReactMarkdown from 'react-markdown'

import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'

import rehypeKatex from 'rehype-katex'
// import rehypeStringify from 'rehype-stringify'
// import remarkStringify from 'remark-stringify'

import { RxClipboardCopy } from 'react-icons/rx'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { IconButton } from '@radix-ui/themes'

export interface MarkdownProps {
  className?: string
  children: string
}

export const Markdown = ({ className, children }: MarkdownProps) => {
  // console.log(children)
  return (
    <ReactMarkdown
      className={`prose dark:prose-invert max-w-none ${className}`}
      remarkPlugins={[remarkParse, remarkMath, remarkRehype, remarkGfm, 
        // remarkStringify
      ]}
      rehypePlugins={[rehypeKatex]}//, rehypeStringify]}
      components={{
        // pre(props) {
        //   console.log(JSON.stringify(props, null, 2))
        //   return {props.children}
        // },
        code(props) {
          console.log(props)
          // @ts-ignore
          const { children, className, ref, node, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          const minWidthEm = `${`${children}`.split('\n').length.toString().length}.25em`;
          const containsNewline = `${children}`.includes('\n');
            return (
              <>
                {containsNewline ? (
                <IconButton
                  className="absolute right-4 top-4 copy-btn"
                  variant="solid"
                  data-clipboard-text={children}
                >
                  <RxClipboardCopy />
                </IconButton>): null}
                {match ? (
                  <SyntaxHighlighter 
                  {...rest} 
                  style={vscDarkPlus} 
                  language={match[1]} 
                  PreTag="div"
                  showLineNumbers={true}
                  showInlineLineNumbers={false}
                  lineNumberStyle={{ 
                    color: 'gray' ,
                    minWidth: minWidthEm,
                    paddingRight: '1em',
                    textAlign: 'right',
                    userSelect: 'none'
                  }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code ref={ref} {...rest} className={className}>
                    {children}
                  </code>
                )}
              </>
            )
          // }
          
          
        }
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default Markdown
