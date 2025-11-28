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
import { ArrowLeft, Loader2, Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, Copy, Sparkles } from "lucide-react";
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

const TEMPLATE_DATA = [
    {
        english: "Serendipity",
        bangla: "আকস্মিক সৌভাগ্য",
        partOfSpeech: "Noun",
        pronunciation: "সেরেনডিপিটি",
        explanation: "The occurrence of events by chance in a happy or beneficial way; finding something good without looking for it",
        synonyms: ["luck", "fortune", "chance", "providence", "happenstance"],
        antonyms: ["misfortune", "bad luck", "unluckiness", "adversity", "calamity"],
        examples: [
            {
                en: "Finding that rare book at the garage sale was pure serendipity",
                bn: "গ্যারেজ বিক্রয়ে সেই দুর্লভ বইটি খুঁজে পাওয়া ছিল সম্পূর্ণ আকস্মিক সৌভাগ্য"
            }
        ]
    },
    {
        english: "Ephemeral",
        bangla: "ক্ষণস্থায়ী",
        partOfSpeech: "Adjective",
        pronunciation: "এফেমেরাল",
        explanation: "Lasting for a very short time; transitory or fleeting in nature",
        synonyms: ["temporary", "fleeting", "transient", "momentary", "short-lived"],
        antonyms: ["permanent", "lasting", "eternal", "enduring", "perpetual"],
        examples: [
            {
                en: "The beauty of cherry blossoms is ephemeral, lasting only a few weeks each spring",
                bn: "চেরি ফুলের সৌন্দর্য ক্ষণস্থায়ী, প্রতি বসন্তে মাত্র কয়েক সপ্তাহ স্থায়ী হয়"
            }
        ]
    }
];

const AI_PROMPT = `
Generate advanced academic vocabulary words suitable for IELTS Writing Task 2 at Band 7+ level, focusing on formal essay contexts. The words should be sophisticated and commonly used in discussions of social issues, environment, education, and technology.

Each vocabulary entry must include:
- English word
- Bangla translation with native-like translation
- Part of speech(Noun,Verb,Adjective,Adverb,Preposition,Conjunction,Pronoun,Interjection,Phrase,Phrase,Idiom,Phrasal Verb,Phrasal Verb,Linking Phrase)
- Pronunciation guide in both English phonetics and Bangla
- Clear and comprehensive explanation
- At least 5 synonyms
- At least 5 antonyms
- 1–2 example sentences demonstrating natural usage in IELTS writing style

Present the output as a JSON array following this structure:

{
  "english": "Serendipity",
  "bangla": "আকস্মিক সৌভাগ্য",
  "partOfSpeech": "Noun",
  "pronunciation": "সেরেনডিপিটি",
  "explanation": "The occurrence of events by chance in a happy or beneficial way; finding something good without looking for it",
  "synonyms": [
    "luck",
    "fortune",
    "chance",
    "providence",
    "happenstance"
  ],
  "antonyms": [
    "misfortune",
    "bad luck",
    "unluckiness",
    "adversity",
    "calamity"
  ],
  "examples": [
    {
      "en": "Finding that rare book at the garage sale was pure serendipity",
      "bn": "গ্যারেজ বিক্রয়ে সেই দুর্লভ বইটি খুঁজে পাওয়া ছিল সম্পূর্ণ আকস্মিক সৌভাগ্য"
    }
  ]
}

Format the output as JSON array matching this structure: ${JSON.stringify(TEMPLATE_DATA[0], null, 2)}".
`;


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

    const copyTemplate = (type: "json" | "csv" | "prompt") => {
        let content = "";

        if (type === "json") {
            content = JSON.stringify(TEMPLATE_DATA, null, 2);
        } else if (type === "csv") {
            const headers = "english,bangla,partOfSpeech,pronunciation,explanation,synonyms,antonyms,examples_en,examples_bn";
            const rows = TEMPLATE_DATA.map(item =>
                `"${item.english}","${item.bangla}","${item.partOfSpeech}","${item.pronunciation}","${item.explanation}","${item.synonyms.join(';')}","${item.antonyms.join(';')}","${item.examples[0].en}","${item.examples[0].bn}"`
            );
            content = [headers, ...rows].join("\n");
        } else {
            content = AI_PROMPT;
        }

        navigator.clipboard.writeText(content);
        toast.success(type === "prompt" ? "AI prompt copied!" : "Template copied to clipboard!");
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
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 pt-4 sm:pt-6 md:pt-8 pb-6 sm:pb-8 md:pb-12"
            >
                <div className="max-w-5xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="mb-3 sm:mb-4 text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 sm:h-9 sm:w-9"
                    >
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold mb-1">Bulk Add Vocabularies</h1>
                    <p className="text-primary-foreground/80 text-xs sm:text-sm">
                        Upload multiple words at once using JSON or CSV format
                    </p>
                </div>
            </motion.header>

            <div className="max-w-5xl mx-auto px-3 sm:px-4 -mt-4 sm:-mt-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-3 sm:p-4 md:p-6 shadow-hover">
                        <Tabs defaultValue="json" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-9 sm:h-10">
                                <TabsTrigger value="json" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                    <FileJson className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden xs:inline">JSON Format</span>
                                    <span className="xs:hidden">JSON</span>
                                </TabsTrigger>
                                <TabsTrigger value="csv" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                    <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden xs:inline">CSV Format</span>
                                    <span className="xs:hidden">CSV</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* JSON Tab */}
                            <TabsContent value="json" className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                    <Label htmlFor="json-input" className="text-sm sm:text-base">Paste JSON Data</Label>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyTemplate("prompt")}
                                            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                                        >
                                            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                            AI Prompt
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyTemplate("json")}
                                            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                                        >
                                            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                            Copy Template
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    id="json-input"
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder={`[\n  {\n    "english": "Serendipity",\n    "bangla": "আকস্মিক সৌভাগ্য",\n    "partOfSpeech": "Noun",\n    "pronunciation": "সেরেনডিপিটি",\n    "explanation": "The occurrence of events by chance",\n    "synonyms": ["luck", "fortune", "chance", "providence", "happenstance"],\n    "antonyms": ["misfortune", "bad luck", "unluckiness", "adversity", "calamity"],\n    "examples": [{"en": "Example sentence", "bn": "উদাহরণ বাক্য"}]\n  }\n]`}
                                    className="min-h-[250px] sm:min-h-[300px] font-mono text-xs sm:text-sm"
                                />
                                <Button
                                    onClick={handleJSONUpload}
                                    disabled={loading || !jsonInput.trim()}
                                    className="w-full h-9 sm:h-10 text-sm sm:text-base"
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
                            <TabsContent value="csv" className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                    <Label htmlFor="csv-input" className="text-sm sm:text-base">Paste CSV Data</Label>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyTemplate("prompt")}
                                            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                                        >
                                            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                            AI Prompt
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyTemplate("csv")}
                                            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                                        >
                                            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                            Copy Template
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    id="csv-input"
                                    value={csvInput}
                                    onChange={(e) => setCsvInput(e.target.value)}
                                    placeholder={`english,bangla,partOfSpeech,pronunciation,explanation,synonyms,antonyms,examples_en,examples_bn\n"Serendipity","আকস্মিক সৌভাগ্য","Noun","সেরেনডিপিটি","The occurrence of events by chance","luck;fortune;chance;providence;happenstance","misfortune;bad luck;unluckiness;adversity;calamity","Example sentence","উদাহরণ বাক্য"`}
                                    className="min-h-[250px] sm:min-h-[300px] font-mono text-xs sm:text-sm"
                                />
                                <Button
                                    onClick={handleCSVUpload}
                                    disabled={loading || !csvInput.trim()}
                                    className="w-full h-9 sm:h-10 text-sm sm:text-base"
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
                            <div className="mt-4 sm:mt-6 space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span>Uploading vocabularies...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        {/* Upload Results */}
                        {uploadResults && (
                            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                {uploadResults.success > 0 && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertTitle className="text-sm sm:text-base">Success</AlertTitle>
                                        <AlertDescription className="text-xs sm:text-sm">
                                            Successfully uploaded {uploadResults.success} vocabularies
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {uploadResults.failed > 0 && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle className="text-sm sm:text-base">Errors</AlertTitle>
                                        <AlertDescription className="text-xs sm:text-sm">
                                            <p className="mb-2">Failed to upload {uploadResults.failed} vocabularies:</p>
                                            <ul className="list-disc list-inside text-xs space-y-1 max-h-32 sm:max-h-40 overflow-y-auto">
                                                {uploadResults.errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setUploadResults(null);
                                            setJsonInput("");
                                            setCsvInput("");
                                        }}
                                        className="flex-1 h-9 sm:h-10 text-sm sm:text-base"
                                    >
                                        Upload More
                                    </Button>
                                    <Button onClick={() => navigate("/vocabularies")} className="flex-1 h-9 sm:h-10 text-sm sm:text-base">
                                        View Vocabularies
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Instructions */}
                    <Card className="mt-4 sm:mt-6 p-4 sm:p-6 bg-muted/30">
                        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Instructions</h3>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                            <li>• Click "AI Prompt" to copy prompt for ChatGPT/Claude to generate IELTS 7+ vocabulary</li>
                            <li>• Click "Copy Template" to get the correct format</li>
                            <li>• Required fields: <code className="bg-muted px-1 py-0.5 rounded text-xs">english</code> and <code className="bg-muted px-1 py-0.5 rounded text-xs">bangla</code></li>
                            <li>• Provide at least 5 synonyms and 5 antonyms for better learning</li>
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
