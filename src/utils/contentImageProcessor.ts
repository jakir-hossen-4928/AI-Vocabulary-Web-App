
import { uploadImage } from "@/services/imageService";

/**
 * Extracts base64 images from content (HTML or Markdown), uploads them to ImgBB,
 * and replaces the base64 sources with the uploaded image URLs.
 *
 * @param content The content string from the rich text editor (HTML or Markdown)
 * @returns The processed content string with remote image URLs
 */
export const processContentImages = async (content: string): Promise<string> => {
    if (!content) return "";

    // Check if content is markdown (contains markdown syntax like ##, *, -, etc.)
    const isMarkdown = /^#{1,6}\s|^\*\s|^-\s|^\d+\.\s|```|^\>|!\[.*\]\(.*\)/m.test(content);

    if (isMarkdown) {
        // For markdown, use regex to find and replace base64 images
        // Markdown image syntax: ![alt](data:image/...)
        const imageRegex = /!\[([^\]]*)\]\((data:image\/[^)]+)\)/g;
        let processedContent = content;
        const matches = Array.from(content.matchAll(imageRegex));

        for (const match of matches) {
            const [fullMatch, altText, base64Src] = match;

            try {
                // Convert base64 to Blob
                const response = await fetch(base64Src);
                const blob = await response.blob();

                // Create a File object from the Blob
                const filename = `content_image_${Date.now()}_${Math.random().toString(36).substring(7)}.${blob.type.split('/')[1]}`;
                const file = new File([blob], filename, { type: blob.type });

                // Upload to ImgBB
                const uploadResponse = await uploadImage(file);

                // Replace the base64 source with the uploaded URL in markdown
                processedContent = processedContent.replace(
                    fullMatch,
                    `![${altText}](${uploadResponse.mediumUrl || uploadResponse.url})`
                );
            } catch (error) {
                console.error("Failed to process inline image:", error);
                // Keep original if upload fails
            }
        }

        return processedContent;
    } else {
        // For HTML, use DOM parser as before
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.getElementsByTagName('img');

        const imageElements = Array.from(images);
        let modified = false;

        for (const img of imageElements) {
            const src = img.getAttribute('src');

            if (src && src.startsWith('data:image')) {
                try {
                    const response = await fetch(src);
                    const blob = await response.blob();

                    const filename = `content_image_${Date.now()}_${Math.random().toString(36).substring(7)}.${blob.type.split('/')[1]}`;
                    const file = new File([blob], filename, { type: blob.type });

                    const uploadResponse = await uploadImage(file);

                    img.setAttribute('src', uploadResponse.mediumUrl || uploadResponse.url);
                    img.setAttribute('data-full-url', uploadResponse.url);
                    img.setAttribute('loading', 'lazy');
                    img.setAttribute('decoding', 'async');
                    modified = true;
                } catch (error) {
                    console.error("Failed to process inline image:", error);
                }
            }
        }

        return modified ? doc.body.innerHTML : content;
    }
};
