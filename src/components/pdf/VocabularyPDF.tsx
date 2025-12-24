import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Bengali font for Bangla text support
// Using local font files from public/bangla-fonts/static directory
Font.register({
    family: 'Bengali',
    fonts: [
        {
            src: '/bangla-fonts/static/NotoSansBengali_Condensed-Regular.ttf',
            fontWeight: 400,
        },
        {
            src: '/bangla-fonts/static/NotoSansBengali_Condensed-SemiBold.ttf',
            fontWeight: 600,
        },
        {
            src: '/bangla-fonts/static/NotoSansBengali_Condensed-Bold.ttf',
            fontWeight: 700,
        },
    ],
});






// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Bengali',  // Changed to Bengali font
        position: 'relative',
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: 60,
        color: 'rgba(30, 64, 175, 0.08)',
        fontWeight: 'bold',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        borderBottom: '3px solid #1e40af',
        paddingBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#1e40af',
        fontWeight: 'bold',
        marginBottom: 3,
    },
    website: {
        fontSize: 10,
        color: '#3b82f6',
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1e40af',
        padding: 12,
        borderRadius: 6,
        marginBottom: 15,
    },
    statsText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    summaryContainer: {
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 6,
        borderLeft: '4px solid #1e40af',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 10,
        color: '#1e40af',
        marginBottom: 4,
    },
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e40af',
        padding: 8,
        fontWeight: 'bold',
        color: 'white',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #ddd',
        padding: 8,
        fontSize: 9,
    },
    tableRowEven: {
        backgroundColor: '#f9f9f9',
    },
    tableCol1: {
        width: '8%',
        fontWeight: 'bold',
        color: '#1e40af',
    },
    tableCol2: {
        width: '30%',
        fontWeight: 'bold',
        color: '#1e40af',
    },
    tableCol3: {
        width: '30%',
        fontWeight: 'bold',
        color: '#1e40af',
    },
    tableCol4: {
        width: '32%',
        fontWeight: 'bold',
        color: '#1e40af',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#1e40af',
        borderTop: '2px solid #e5e7eb',
        paddingTop: 10,
    },
    footerText: {
        marginBottom: 3,
        fontWeight: 'bold',
    },
    footerSupport: {
        fontSize: 8,
        color: '#3b82f6',
        marginTop: 5,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 15,
        right: 40,
        fontSize: 8,
        color: '#1e40af',
    },
});

interface VocabularyPDFProps {
    vocabularies: Array<{
        id: string;
        bangla: string;
        english: string;
        synonyms?: string[];
    }>;
    partOfSpeech: string;
    exportDate: string;
    exportDateTime: string;
}

export const VocabularyPDF = ({ vocabularies, partOfSpeech, exportDate, exportDateTime }: VocabularyPDFProps) => {
    const currentYear = new Date().getFullYear();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark - only on last page */}
                <Text style={styles.watermark}>ai-vocabulary-coach.netlify.app</Text>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>AI Vocab</Text>
                    <Text style={styles.subtitle}>Vocabulary List - {partOfSpeech}</Text>
                    <Text style={styles.website}>ai-vocabulary-coach.netlify.app</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>📚 Total: {vocabularies.length}</Text>
                    <Text style={styles.statsText}>📅 {exportDate}</Text>
                    <Text style={styles.statsText}>🕐 {exportDateTime}</Text>
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Export Summary</Text>
                    <Text style={styles.summaryText}>Part of Speech: {partOfSpeech}</Text>
                    <Text style={styles.summaryText}>Total Vocabularies: {vocabularies.length} words</Text>
                    <Text style={styles.summaryText}>Export Date & Time: {exportDateTime}</Text>
                </View>

                {/* Table with visible header */}
                <View style={styles.table}>
                    {/* Table Header - Visible and repeats on every page */}
                    <View style={styles.tableHeader} fixed>
                        <Text style={styles.tableCol1}>#</Text>
                        <Text style={styles.tableCol2}>Bangla</Text>
                        <Text style={styles.tableCol3}>English</Text>
                        <Text style={styles.tableCol4}>Synonyms</Text>
                    </View>

                    {/* Table Rows */}
                    {vocabularies.map((vocab, index) => (
                        <View
                            key={vocab.id}
                            style={[
                                styles.tableRow,
                                index % 2 === 0 ? styles.tableRowEven : {}
                            ]}
                            wrap={false}
                        >
                            <Text style={styles.tableCol1}>{index + 1}</Text>
                            <Text style={[styles.tableCol2, { wordWrap: false }]}>{vocab.bangla || '-'}</Text>
                            <Text style={styles.tableCol3}>{vocab.english || '-'}</Text>
                            <Text style={styles.tableCol4}>
                                {vocab.synonyms && vocab.synonyms.length > 0 ? vocab.synonyms.join(', ') : '-'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Footer - Only on last page (no 'fixed' prop) */}
                <View style={styles.footer} break>
                    <Text style={styles.footerText}>Generated by AI Vocab</Text>
                    <Text style={styles.footerText}>🌐 https://ai-vocabulary-coach.netlify.app</Text>
                    <Text style={styles.footerSupport}>
                        💙 Support the Developer: Jakir Hossen{'\n'}
                        Building tools to help you learn better • © {currentYear} All rights reserved
                    </Text>
                </View>

                {/* Page Numbers */}
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};
