
import { useState, useEffect, useMemo, useRef } from "react";
import { dexieService } from "@/lib/dexieDb";
import { syncService } from "@/services/syncService";
import { Vocabulary } from "@/types/vocabulary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDown, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import partOfSpeechData from "@/data/partOfSpeech.json";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useVirtualizer } from "@tanstack/react-virtual";
import html2pdf from "html2pdf.js";

export default function PrintVocabulary() {
    const navigate = useNavigate();

    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [selectedPOS, setSelectedPOS] = useState<string>("");

    useEffect(() => {
        loadVocabularies();
    }, []);

    const loadVocabularies = async () => {
        try {
            setIsLoading(true);
            const vocabs = await dexieService.getAllVocabularies();
            setVocabularies(vocabs);

            if (!selectedPOS && vocabs.length > 0) {
                const firstPOS = vocabs[0].partOfSpeech;
                setSelectedPOS(firstPOS);
            }
        } catch (error) {
            console.error("Error loading vocabularies:", error);
            toast.error("Failed to load vocabularies");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            toast.info("Syncing with server...");
            await syncService.syncVocabularies();
            await loadVocabularies();
            toast.success("Sync completed successfully!");
        } catch (error) {
            console.error("Error syncing:", error);
            toast.error("Sync failed. Using local data.");
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredVocabs = useMemo(() => {
        if (!selectedPOS) return [];
        return vocabularies.filter(v => v.partOfSpeech === selectedPOS);
    }, [vocabularies, selectedPOS]);

    const handleGeneratePDF = async () => {
        if (!selectedPOS) {
            toast.error("Please select a part of speech first");
            return;
        }
        if (filteredVocabs.length === 0) {
            toast.error("No vocabularies found for selected part of speech");
            return;
        }

        try {
            setIsGeneratingPDF(true);
            toast.info(`Generating PDF with ${filteredVocabs.length} words...`);

            const pdfElement = document.createElement("div");
            pdfElement.id = "pdf-content";

            const exportDate = new Date().toLocaleDateString();
            const exportDateTime = new Date().toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });

            // Simplified inline styles for better performance
            pdfElement.innerHTML = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; position: relative;">
                    <!-- Watermark -->
                    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; font-weight: bold; color: rgba(30, 64, 175, 0.08); z-index: 0; white-space: nowrap; pointer-events: none;">
                        ai-vocabulary-coach.netlify.app
                    </div>
                    
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #1e40af; padding-bottom: 15px; position: relative; z-index: 1;">
                        <h1 style="color: #1e40af; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">AI Vocab</h1>
                        <p style="color: #1e40af; font-size: 14px; margin: 3px 0; font-weight: 600;">Vocabulary List - ${selectedPOS}</p>
                        <p style="font-size: 12px; color: #3b82f6; font-weight: 600;">ai-vocabulary-coach.netlify.app</p>
                    </div>
                    
                    <!-- Stats -->
                    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; z-index: 1;">
                        <span style="font-weight: 600;">📚 Total: ${filteredVocabs.length}</span>
                        <span style="font-weight: 600;">📅 ${exportDate}</span>
                        <span style="font-weight: 600;">🕐 ${exportDateTime}</span>
                    </div>
                    
                    <!-- Summary -->
                    <div style="background: #eff6ff; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #1e40af; position: relative; z-index: 1;">
                        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1e40af; font-weight: 600;">Export Summary</h3>
                        <p style="margin: 6px 0; color: #1e40af; font-size: 14px; font-weight: 500;"><strong>Part of Speech:</strong> ${selectedPOS}</p>
                        <p style="margin: 6px 0; color: #1e40af; font-size: 14px; font-weight: 500;"><strong>Total Vocabularies:</strong> ${filteredVocabs.length} words</p>
                        <p style="margin: 6px 0; color: #1e40af; font-size: 14px; font-weight: 500;"><strong>Export Date & Time:</strong> ${exportDateTime}</p>
                    </div>
                    
                    <!-- Table with repeating header -->
                    <table style="width: 100%; border-collapse: collapse; position: relative; z-index: 1; background: white;">
                        <thead style="display: table-header-group;">
                            <tr style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);">
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; color: #fff; font-weight: 600; text-transform: uppercase; width: 40px;">#</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; color: #fff; font-weight: 600; text-transform: uppercase;">Bangla</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; color: #fff; font-weight: 600; text-transform: uppercase;">English</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; color: #fff; font-weight: 600; text-transform: uppercase;">Synonyms</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredVocabs.map((vocab, index) => `
                                <tr style="page-break-inside: avoid; ${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
                                    <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; font-weight: 600; color: #1e40af;">${index + 1}</td>
                                    <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; font-weight: 600; color: #1e40af;">${vocab.bangla || '-'}</td>
                                    <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; font-weight: 600; color: #1e40af;">${vocab.english || '-'}</td>
                                    <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; font-weight: 600; color: #1e40af;">${vocab.synonyms && vocab.synonyms.length > 0 ? vocab.synonyms.join(", ") : "-"}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <!-- Footer -->
                    <div style="margin-top: 30px; text-align: center; color: #1e40af; font-size: 12px; border-top: 2px solid #e5e7eb; padding-top: 15px; position: relative; z-index: 1;">
                        <p style="margin: 5px 0; font-weight: 600;"><strong>Generated by AI Vocab</strong></p>
                        <p style="margin: 5px 0; font-weight: 600;">🌐 https://ai-vocabulary-coach.netlify.app</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #3b82f6; font-weight: 500;">
                            💙 Support the Developer: <strong>Jakir Hossen</strong><br>
                            Building tools to help you learn better • © ${new Date().getFullYear()} All rights reserved
                        </p>
                    </div>
                </div>
            `;

            document.body.appendChild(pdfElement);

            // Optimized settings for large datasets (2500+ vocabularies)
            const opt = {
                margin: [15, 15, 15, 15],
                filename: `vocabulary-${selectedPOS.toLowerCase()}-${exportDate.replace(/\//g, '-')}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.92  // Balanced quality for performance
                },
                html2canvas: {
                    scale: 1.5,  // Reduced for better performance with large datasets
                    useCORS: true,
                    letterRendering: true,
                    logging: false,  // Disable logging
                    windowWidth: 1200
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true  // Enable PDF compression
                },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                    avoid: 'tr'  // Avoid breaking table rows
                }
            };

            await html2pdf().set(opt).from(pdfElement).save();
            document.body.removeChild(pdfElement);

            toast.success(`PDF generated successfully with ${filteredVocabs.length} words!`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF. Try with fewer vocabularies if issue persists.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: filteredVocabs.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
        overscan: 10,
    });

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-background">
            <motion.header initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground hover:bg-primary-foreground/10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleSync} disabled={isSyncing} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "Syncing..." : "Sync with Server"}
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold mb-1">Download Vocabulary PDF</h1>
                    <p className="text-primary-foreground/80 text-sm">Select a part of speech and download as PDF • Using local database</p>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
                <Card className="shadow-lg">
                    <CardHeader><CardTitle>Select Part of Speech</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Part of Speech (Required)</Label>
                                <Select value={selectedPOS} onValueChange={setSelectedPOS}>
                                    <SelectTrigger><SelectValue placeholder="Select a part of speech" /></SelectTrigger>
                                    <SelectContent>
                                        {partOfSpeechData.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {selectedPOS ? `${filteredVocabs.length} words available` : "Please select a part of speech"}
                                </p>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleGeneratePDF} disabled={!selectedPOS || filteredVocabs.length === 0 || isGeneratingPDF} className="w-full gap-2" size="lg">
                                    <FileDown className="h-5 w-5" />
                                    {isGeneratingPDF ? "Generating..." : `Download ${selectedPOS ? `${filteredVocabs.length} ${selectedPOS}` : "Vocabulary"} PDF`}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {selectedPOS && filteredVocabs.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 pb-8">
                    <Card>
                        <CardHeader><CardTitle>Preview ({filteredVocabs.length} words)</CardTitle></CardHeader>
                        <CardContent>
                            <div ref={parentRef} className="h-[500px] overflow-auto border rounded-lg">
                                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-muted z-10">
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-semibold w-12">#</th>
                                                <th className="text-left p-3 font-semibold">Bangla</th>
                                                <th className="text-left p-3 font-semibold">English</th>
                                                <th className="text-left p-3 font-semibold">Synonyms</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                                const vocab = filteredVocabs[virtualRow.index];
                                                return (
                                                    <tr key={virtualRow.key} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }} className="border-b hover:bg-muted/50">
                                                        <td className="p-3 text-sm">{virtualRow.index + 1}</td>
                                                        <td className="p-3 font-medium">{vocab.bangla}</td>
                                                        <td className="p-3 font-medium">{vocab.english}</td>
                                                        <td className="p-3 text-sm text-muted-foreground">
                                                            {vocab.synonyms && vocab.synonyms.length > 0 ? vocab.synonyms.slice(0, 3).join(", ") : "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
