import { DefaultTemplate, DefaultTemplateRef } from "@/richtexteditor/DefaultTemplate";
import { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export interface RichTextEditorRef {
    getContent: () => string;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    ({ value, onChange, placeholder, className }, ref) => {
        const initialValueRef = useRef(value);
        const contentRef = useRef(value);
        const editorRef = useRef<DefaultTemplateRef | null>(null);

        // Initial value injection
        const onReady = (methods: DefaultTemplateRef) => {
            editorRef.current = methods;
            if (initialValueRef.current) {
                methods.injectMarkdown(initialValueRef.current);
            }
        };

        // Store content in ref without triggering parent onChange
        const handleContentChange = useCallback((newValue: string) => {
            contentRef.current = newValue;
        }, []);

        // Expose method to get current content
        useImperativeHandle(ref, () => ({
            getContent: () => contentRef.current,
        }));

        return (
            <div className={cn("rich-text-editor", className)}>
                <DefaultTemplate
                    className="min-h-[400px] border rounded-xl overflow-hidden shadow-sm"
                    onReady={onReady}
                    onChange={handleContentChange}
                />
            </div>
        );
    }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
