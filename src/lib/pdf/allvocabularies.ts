import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { Vocabulary } from '@/types/vocabulary';

interface GeneratePdfOptions {
    vocabularies: Vocabulary[];
    userName: string;
    userEmail: string;
}

export const generateVocabulariesPDF = async ({ vocabularies, userName, userEmail }: GeneratePdfOptions) => {
    try {
        const exportDate = format(new Date(), "PPP");
        const totalWords = vocabularies.length;

        // Create a container for PDF content
        const pdfContainer = document.createElement('div');
        pdfContainer.id = 'pdf-content';
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-10000px';
        pdfContainer.style.top = '0';
        pdfContainer.style.width = '210mm';
        pdfContainer.style.padding = '20px';
        pdfContainer.style.backgroundColor = '#fff';

        // Self-contained HTML with inline styles
        pdfContainer.innerHTML = `
            <style>
                .pdf-content {
                    font-family: Arial, sans-serif;
                    color: #1f2937;
                    line-height: 1.5;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 3px solid #3b82f6;
                    padding-bottom: 10px;
                }
                .header h1 {
                    font-size: 28px;
                    margin: 0 0 5px 0;
                    color: #1e40af;
                    font-weight: 700;
                }
                .tagline {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                    font-style: italic;
                }
                .report-info {
                    margin-bottom: 20px;
                    background: #f3f4f6;
                    padding: 12px;
                    border-radius: 6px;
                    border-left: 4px solid #3b82f6;
                }
                .user-details p {
                    margin: 3px 0;
                    font-size: 12px;
                }
                .vocab-item {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                    background: #fff;
                    page-break-inside: avoid;
                }
                .vocab-header {
                    margin-bottom: 10px;
                    border-bottom: 1px solid #f3f4f6;
                    padding-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .vocab-number {
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: bold;
                }
                .vocab-word {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111827;
                }
                .vocab-pos {
                    font-size: 12px;
                    color: #4b5563;
                    font-style: italic;
                }
                .vocab-pronunciation {
                    color: #6b7280;
                    font-size: 11px;
                    margin-left: auto;
                    font-family: 'Lucida Sans Unicode', Arial, sans-serif;
                }
                .vocab-main-meaning, .vocab-section {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .label {
                    color: #4b5563;
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: bold;
                }
                .content {
                    color: #1f2937;
                }
                .highlight {
                    color: #1e40af;
                    font-weight: 600;
                }
                .vocab-examples {
                    margin-top: 8px;
                    background: #f9fafb;
                    padding: 10px;
                    border-radius: 4px;
                }
                .ex-item {
                    margin-top: 5px;
                    font-size: 11px;
                }
                .ex-en {
                    color: #374151;
                    font-style: italic;
                }
                .ex-bn {
                    color: #6b7280;
                    margin-left: 10px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 10px;
                    color: #9ca3af;
                }
                @media print {
                    .vocab-item {
                        page-break-inside: avoid;
                    }
                }
            </style>
            <div class="pdf-content">
                <!-- Header -->
                <div class="header">
                    <h1>Vocabulary Collection</h1>
                    <p class="tagline">Your personalized learning journey</p>
                </div>

                <!-- User Info -->
                <div class="report-info">
                    <div class="user-details">
                        <p><strong>Learner:</strong> ${userName}</p>
                        <p><strong>Email:</strong> ${userEmail}</p>
                        <p><strong>Date:</strong> ${exportDate}</p>
                        <p><strong>Total Words:</strong> ${totalWords}</p>
                    </div>
                </div>

                <!-- Vocabulary List -->
                ${vocabularies.map((vocab, index) => `
                    <div class="vocab-item">
                        <!-- Word Header -->
                        <div class="vocab-header">
                            <span class="vocab-number">#${index + 1}</span>
                            <span class="vocab-word">${vocab.english || '-'}</span>
                            <span class="vocab-pos">(${vocab.partOfSpeech || '-'})</span>
                            <div class="vocab-pronunciation">/${vocab.pronunciation || '-'}/</div>
                        </div>

                        <!-- Word Body -->
                        <div>
                            <!-- Meaning -->
                            <div class="vocab-main-meaning">
                                <span class="label">Meaning:</span>
                                <span class="content highlight">${vocab.bangla || '-'}</span>
                            </div>

                            ${vocab.explanation ? `
                            <div class="vocab-section">
                                <span class="label">Explanation:</span>
                                <span class="content">${vocab.explanation}</span>
                            </div>` : ''}

                            ${vocab.synonyms && vocab.synonyms.length > 0 ? `
                            <div class="vocab-section">
                                <span class="label">Synonyms:</span>
                                <span class="content">${vocab.synonyms.join(', ')}</span>
                            </div>` : ''}

                            ${vocab.antonyms && vocab.antonyms.length > 0 ? `
                            <div class="vocab-section">
                                <span class="label">Antonyms:</span>
                                <span class="content">${vocab.antonyms.join(', ')}</span>
                            </div>` : ''}

                            ${vocab.examples && vocab.examples.length > 0 ? `
                            <div class="vocab-examples">
                                <span class="label">Examples:</span>
                                ${vocab.examples.map(ex => `
                                    <div class="ex-item">
                                        <div class="ex-en">• ${ex.en || '-'}</div>
                                        <div class="ex-bn">${ex.bn || '-'}</div>
                                    </div>
                                `).join('')}
                            </div>` : ''}
                        </div>
                    </div>
                `).join('')}

                <!-- Footer -->
                <div class="footer">
                    <p>Generated by AI Vocabulary Coach</p>
                    <p style="color: #d1d5db;">${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;

        document.body.appendChild(pdfContainer);

        // Configure html2pdf options with fixes for blank PDF
        const opt = {
            async: true,
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `vocabulary-collection-${format(new Date(), "yyyy-MM-dd")}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 1,
                useCORS: true,
                letterRendering: true,
                allowTaint: true,
                scrollY: 0,
                timeout: 0,
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate and save PDF
        await html2pdf()
            .set(opt)
            .from(pdfContainer)
            .save();

        // Clean up
        document.body.removeChild(pdfContainer);

        console.log(`Exported vocabulary collection for ${userName}`);
        return true;
    } catch (error) {
        console.error("Error generating PDF:", error);
        // Clean up on error
        const pdfContainer = document.getElementById('pdf-content');
        if (pdfContainer) {
            document.body.removeChild(pdfContainer);
        }
        throw error;
    }
};