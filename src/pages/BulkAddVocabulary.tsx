import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Vocabulary } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface BulkVocabulary {
    english: string;
    bangla: string;
    partOfSpeech?: string;
    pronunciation?: string;
    explanation?: string;
    synonyms?: string[];
    antonyms?: string[];
    examples?: { en: string; bn: string }[];
}

export default function BulkAddVocabulary() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [csvInput, setCsvInput] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResults, setUploadResults] = useState<{
        success: number;
        failed: number;
        errors: string[];
    } | null>(null);

    if (!user || !isAdmin) {
        navigate("/");
        return null;
    }

    const downloadTemplate = (type: "json" | "csv") => {
        const sampleData = [
            {
                english: "Serendipity",
                bangla: "আকস্মিক প্রাপ্তি",
                partOfSpeech: "Noun",
                pronunciation: "/ˌser.ənˈdɪp.ə.ti/",
                explanation: "The occurrence of events by chance in a happy or beneficial way",
                synonyms: ["luck", "fortune", "chance"],
                antonyms: ["misfortune", "bad luck"],
                examples: [
                    { en: "Finding that book was pure serendipity", bn: "সেই বইটি খুঁজে পাওয়া ছিল সম্পূর্ণ আকস্মিক প্রাপ্তি" }
                ]
            },
            {
                english: "Ephemeral",
                bangla: "ক্ষণস্থায়ী",
                partOfSpeech: "Adjective",
                pronunciation: "/ɪˈfem.ər.əl/",
                explanation: "Lasting for a very short time",
                synonyms: ["temporary", "fleeting", "transient"],
                antonyms: ["permanent", "lasting", "eternal"],
                examples: [
                    { en: "The beauty of cherry blossoms is ephemeral", bn: "চেরি ফুলের সৌন্দর্য ক্ষণস্থায়ী" }
                ]
            }
        ];

        if (type === "json") {
            const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "vocabulary_template.json";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Template downloaded");
        } else {
            const headers = "english,bangla,partOfSpeech,pronunciation,explanation,synonyms,antonyms,examples_en,examples_bn";
            const rows = sampleData.map(item =>
                `"${item.english}","${item.bangla}","${item.partOfSpeech}","${item.pronunciation}","${item.explanation}","${item.synonyms.join(';')}","${item.antonyms.join(';')}","${item.examples[0].en}","${item.examples[0].bn}"`
            );
            const csv = [headers, ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "vocabulary_template.csv";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Template downloaded");
        }
    };

    const parseCSV = (csv: string): BulkVocabulary[] => {
        const lines = csv.trim().split("\n");
        if (lines.length < 2) {
            throw new Error("CSV must have at least a header row and one data row");
        }

        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const data: BulkVocabulary[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ""));

            if (cleanValues.length === 0) continue;

            const row: any = {};
            headers.forEach((header, index) => {
                const value = cleanValues[index] || "";

                if (header === "synonyms" || header === "antonyms") {
                    row[header] = value ? value.split(";").map(s => s.trim()).filter(Boolean) : [];
                } else if (header === "examples_en" || header === "examples_bn") {
                    // Handle examples
                    if (!row.examples) row.examples = [];
                    if (header === "examples_en" && value) {
                        row.examples.push({ en: value, bn: "" });
                    } else if (header === "examples_bn" && value && row.examples.length > 0) {
                        row.examples[row.examples.length - 1].bn = value;
                    }
                } else {
                    row[header] = value;
                }
            });

            if (row.english && row.bangla) {
                data.push(row);
            }
        }

        return data;
    };

    const validateVocabulary = (vocab: BulkVocabulary): string | null => {
        if (!vocab.english || !vocab.bangla) {
            return "English and Bangla fields are required";
        }
        if (vocab.english.trim().length === 0 || vocab.bangla.trim().length === 0) {
            return "English and Bangla cannot be empty";
        }
        return null;
    };

    const handleBulkUpload = async (vocabularies: BulkVocabulary[]) => {
        if (vocabularies.length === 0) {
            toast.error("No valid vocabularies to upload");
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        setUploadResults(null);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        try {
            const batch = writeBatch(db);
            const timestamp = new Date().toISOString();

            for (let i = 0; i < vocabularies.length; i++) {
                const vocab = vocabularies[i];
                const error = validateVocabulary(vocab);

                if (error) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1}: ${error}`);
                    continue;
                }

                try {
                    const docRef = doc(collection(db, "vocabularies"));
                    const data: Omit<Vocabulary, "id"> = {
                        english: vocab.english.trim(),
                        bangla: vocab.bangla.trim(),
                        partOfSpeech: vocab.partOfSpeech || "",
                        pronunciation: vocab.pronunciation || "",
                        explanation: vocab.explanation || "",
                        synonyms: vocab.synonyms || [],
                        antonyms: vocab.antonyms || [],
                        examples: vocab.examples || [],
                        userId: user!.uid,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                    };

                    batch.set(docRef, data);
                    results.success++;
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
                }

                setUploadProgress(((i + 1) / vocabularies.length) * 100);
            }

            if (results.success > 0) {
                await batch.commit();
                toast.success(`Successfully uploaded ${results.success} vocabularies`);
            }

            if (results.failed > 0) {
                toast.error(`Failed to upload ${results.failed} vocabularies`);
            }

            setUploadResults(results);
        } catch (error) {
            console.error("Error uploading vocabularies:", error);
            toast.error("Failed to upload vocabularies");
        } finally {
            setLoading(false);
        }
    };

    const handleJSONUpload = async () => {
        try {
            const data = JSON.parse(jsonInput);
            const vocabularies = Array.isArray(data) ? data : [data];
            await handleBulkUpload(vocabularies);
        } catch (error) {
            toast.error("Invalid JSON format");
            console.error(error);
        }
    };

    const handleCSVUpload = async () => {
        try {
            const vocabularies = parseCSV(csvInput);
            await handleBulkUpload(vocabularies);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Invalid CSV format");
            console.error(error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "json" | "csv") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (type === "json") {
                setJsonInput(content);
            } else {
                setCsvInput(content);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-background pb-8">
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
            >
                <div className="max-w-5xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold mb-1">Bulk Add Vocabularies</h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Upload multiple words at once using JSON or CSV format
                    </p>
                </div>
            </motion.header>

            <div className="max-w-5xl mx-auto px-4 -mt-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6 shadow-hover">
                        <Tabs defaultValue="json" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="json" className="gap-2">
                                    <FileJson className="h-4 w-4" />
                                    JSON Format
                                </TabsTrigger>
                                <TabsTrigger value="csv" className="gap-2">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    CSV Format
                                </TabsTrigger>
                            </TabsList>

                            {/* JSON Tab */}
                            <TabsContent value="json" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="json-input">Paste JSON Data</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate("json")}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Template
                                        </Button>
                                        <Label htmlFor="json-file" className="cursor-pointer">
                                            <Button type="button" variant="outline" size="sm" asChild>
                                                <span>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload File
                                                </span>
                                            </Button>
                                            <input
                                                id="json-file"
                                                type="file"
                                                accept=".json"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, "json")}
                                            />
                                        </Label>
                                    </div>
                                </div>
                                <Textarea
                                    id="json-input"
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder={`[\n  {\n    "english": "Serendipity",\n    "bangla": "আকস্মিক প্রাপ্তি",\n    "partOfSpeech": "Noun",\n    "pronunciation": "/ˌser.ənˈdɪp.ə.ti/",\n    "explanation": "The occurrence of events by chance",\n    "synonyms": ["luck", "fortune"],\n    "antonyms": ["misfortune"],\n    "examples": [{"en": "Example sentence", "bn": "উদাহরণ বাক্য"}]\n  }\n]`}
                                    className="min-h-[300px] font-mono text-sm"
                                />
                                <Button
                                    onClick={handleJSONUpload}
                                    disabled={loading || !jsonInput.trim()}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload JSON Data
                                        </>
                                    )}
                                </Button>
                            </TabsContent>

                            {/* CSV Tab */}
                            <TabsContent value="csv" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="csv-input">Paste CSV Data</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate("csv")}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Template
                                        </Button>
                                        <Label htmlFor="csv-file" className="cursor-pointer">
                                            <Button type="button" variant="outline" size="sm" asChild>
                                                <span>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload File
                                                </span>
                                            </Button>
                                            <input
                                                id="csv-file"
                                                type="file"
                                                accept=".csv"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, "csv")}
                                            />
                                        </Label>
                                    </div>
                                </div>
                                <Textarea
                                    id="csv-input"
                                    value={csvInput}
                                    onChange={(e) => setCsvInput(e.target.value)}
                                    placeholder={`english,bangla,partOfSpeech,pronunciation,explanation,synonyms,antonyms,examples_en,examples_bn\n"Serendipity","আকস্মিক প্রাপ্তি","Noun","/ˌser.ənˈdɪp.ə.ti/","The occurrence of events by chance","luck;fortune","misfortune","Example sentence","উদাহরণ বাক্য"`}
                                    className="min-h-[300px] font-mono text-sm"
                                />
                                <Button
                                    onClick={handleCSVUpload}
                                    disabled={loading || !csvInput.trim()}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload CSV Data
                                        </>
                                    )}
                                </Button>
                            </TabsContent>
                        </Tabs>

                        {/* Upload Progress */}
                        {loading && (
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading vocabularies...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        {/* Upload Results */}
                        {uploadResults && (
                            <div className="mt-6 space-y-4">
                                {uploadResults.success > 0 && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertTitle>Success</AlertTitle>
                                        <AlertDescription>
                                            Successfully uploaded {uploadResults.success} vocabularies
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {uploadResults.failed > 0 && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Errors</AlertTitle>
                                        <AlertDescription>
                                            <p className="mb-2">Failed to upload {uploadResults.failed} vocabularies:</p>
                                            <ul className="list-disc list-inside text-xs space-y-1 max-h-40 overflow-y-auto">
                                                {uploadResults.errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setUploadResults(null);
                                            setJsonInput("");
                                            setCsvInput("");
                                        }}
                                    >
                                        Upload More
                                    </Button>
                                    <Button onClick={() => navigate("/vocabularies")}>
                                        View Vocabularies
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Instructions */}
                    <Card className="mt-6 p-6 bg-muted/30">
                        <h3 className="font-semibold mb-3">Instructions</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Download the template to see the correct format</li>
                            <li>• Required fields: <code className="bg-muted px-1 py-0.5 rounded">english</code> and <code className="bg-muted px-1 py-0.5 rounded">bangla</code></li>
                            <li>• For CSV: Use semicolons (;) to separate multiple synonyms/antonyms</li>
                            <li>• For JSON: Provide arrays for synonyms, antonyms, and examples</li>
                            <li>• Maximum 500 words per upload for optimal performance</li>
                        </ul>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
