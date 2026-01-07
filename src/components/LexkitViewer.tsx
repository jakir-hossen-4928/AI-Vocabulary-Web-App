import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface LexkitViewerProps {
    markdown: string;
    className?: string;
}

export const LexkitViewer = ({ markdown, className }: LexkitViewerProps) => {
    return (
        <div className={cn("prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none", className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
};
