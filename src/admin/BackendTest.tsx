import Papa from 'papaparse';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Pencil, Trash, Plus, RefreshCw, Download, Upload } from "lucide-react";
import { toast } from "sonner";

const VALID_POS = [
    "Noun",
    "Verb",
    "Adjective",
    "Adverb",
    "Preposition",
    "Conjunction",
    "Pronoun",
    "Interjection",
    "Phrase",
    "Idiom",
    "Phrasal Verb",
    "Linking Phrase"
];

const BackendTest = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("vocabulary");

    // Selection & Actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // null for Add, object for Edit
    const [formData, setFormData] = useState<any>({}); // Form state

    // Search State
    const [query, setQuery] = useState('');
    const [isRegex, setIsRegex] = useState(false);
    const [selectedPos, setSelectedPos] = useState<string>('');

    // Resource/User Search State
    const [resourceQuery, setResourceQuery] = useState('');
    const [userQuery, setUserQuery] = useState('');

    const [counts, setCounts] = useState({ vocabulary: 0, resources: 0, users: 0 });

    // Upload State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");

    // Load data when tab changes or search params change
    useEffect(() => {
        handleSearch();
    }, [activeTab]); // We could add other deps but manual search trigger is often better for admin tools

    const handleSearch = async () => {
        setLoading(true);
        setSelectedIds(new Set()); // Clear selection
        try {
            let url = '';
            if (activeTab === 'vocabulary') {
                url = `http://localhost:5000/api/vocabularies?search=${encodeURIComponent(query)}&searchMode=${isRegex ? 'regex' : 'partial'}`;
                if (selectedPos && selectedPos !== 'all') {
                    url += `&partOfSpeech=${encodeURIComponent(selectedPos)}`;
                }
            } else if (activeTab === 'resources') {
                url = `http://localhost:5000/api/resources?search=${encodeURIComponent(resourceQuery)}`;
            } else if (activeTab === 'users') {
                url = `http://localhost:5000/api/users?search=${encodeURIComponent(userQuery)}`;
            } else if (activeTab === 'upload') {
                setLoading(false);
                return;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Fetch failed');
            const data = await response.json();
            setResults(data.data || (Array.isArray(data) ? data : [])); // Handle list response or paginated response

            // Update Counts from Meta if available
            if (data.meta && typeof data.meta.total === 'number') {
                setCounts(prev => ({ ...prev, [activeTab]: data.meta.total }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        setLoading(true);
        try {
            const endpoint = activeTab === 'vocabulary' ? 'vocabularies' : activeTab === 'resources' ? 'resources' : 'users';
            const res = await fetch(`http://localhost:5000/api/${endpoint}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Item deleted");
            handleSearch(); // Refresh
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete item");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} items?`)) return;

        setLoading(true);
        try {
            const endpoint = activeTab === 'vocabulary' ? 'vocabularies' : activeTab === 'resources' ? 'resources' : 'users';
            await Promise.all(Array.from(selectedIds).map(id =>
                fetch(`http://localhost:5000/api/${endpoint}/${id}`, { method: 'DELETE' })
            ));
            toast.success("Items deleted");
            setSelectedIds(new Set());
            handleSearch();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete items");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'vocabulary' ? 'vocabularies' : activeTab === 'resources' ? 'resources' : 'users';

            // Backend expects specific fields; ensure formData matches what is needed
            // For vocabulary, we need at least english, bangla.
            // For resource, title.
            // For user, email.

            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem
                ? `http://localhost:5000/api/${endpoint}/${editingItem.id}`
                : `http://localhost:5000/api/${endpoint}`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Save failed");
            toast.success(editingItem ? "Item updated" : "Item created");
            setIsDialogOpen(false);
            setEditingItem(null);
            handleSearch();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save item");
        } finally {
            setLoading(false);
        }
    };

    const openEditDialog = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingItem(null);
        setFormData({});
        if (activeTab === 'vocabulary') {
            setFormData({ partOfSpeech: 'Noun', english: '', bangla: '', explanation: '' });
        } else if (activeTab === 'resources') {
            setFormData({ title: '', description: '', imageUrl: '' });
        } else if (activeTab === 'users') {
            setFormData({ email: '', displayName: '', role: 'user' });
        }
        setIsDialogOpen(true);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(results.map((r: any) => r.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    // --- Upload Logic ---
    const downloadVocabularyTemplate = () => {
        const template = [
            {
                english: "example",
                bangla: "উদাহরণ",
                partOfSpeech: "Noun",
                pronunciation: "ɪɡˈzɑːmpl",
                explanation: "A thing characteristic of its kind or illustrating a general rule",
                synonyms: "sample, specimen, instance",
                antonyms: "",
                examples: '[{"en":"For example, this is a sentence","bn":"উদাহরণস্বরূপ, এটি একটি বাক্য"}]',
                origin: "Latin",
                audioUrl: "",
                isFromAPI: "false",
                isOnline: "false",
                verbForms: "",
                relatedWords: ""
            }
        ];

        const csv = Papa.unparse(template);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocabulary_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Template downloaded");
    };

    const downloadResourceTemplate = () => {
        const template = [
            {
                title: "Example Resource",
                description: "This is an example resource description",
                imageUrl: "https://example.com/image.jpg",
                thumbnailUrl: "https://example.com/thumb.jpg",
                userId: "user-id-here"
            }
        ];

        const csv = Papa.unparse(template);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resource_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Template downloaded");
    };

    const uploadDataInChunks = async (data: any[], endpoint: string, batchSize = 50) => {
        const total = data.length;
        if (total === 0) return;

        for (let i = 0; i < total; i += batchSize) {
            const chunk = data.slice(i, i + batchSize);
            setUploadStatus(`Uploading ${endpoint}... (${Math.min(i + batchSize, total)}/${total})`);

            await fetch(`http://localhost:5000/api/migration/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chunk)
            });

            await new Promise(resolve => setTimeout(resolve, 100)); // Delay
            setUploadProgress(Math.round((Math.min(i + batchSize, total) / total) * 100));
        }
    };

    const handleVocabularyUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (fileExtension === 'json') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    const vocabularies = Array.isArray(json) ? json : [json];

                    setLoading(true);
                    setUploadStatus("Uploading JSON Data...");
                    await uploadDataInChunks(vocabularies, 'vocabularies');
                    toast.success(`Uploaded ${vocabularies.length} vocabularies`);
                    setUploadStatus("Completed");
                } catch (error) {
                    toast.error("Failed to parse JSON file");
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsText(file);
        } else if (fileExtension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    const vocabularies = results.data.map((row: any) => ({
                        english: row.english || "",
                        bangla: row.bangla || "",
                        partOfSpeech: row.partOfSpeech || "Unknown",
                        explanation: row.explanation || "",
                        pronunciation: row.pronunciation || "",
                        examples: row.examples ? (row.examples.startsWith('[') ? JSON.parse(row.examples) : [row.examples]) : [],
                        synonyms: row.synonyms ? row.synonyms.split(',').map((s: string) => s.trim()) : [],
                        antonyms: row.antonyms ? row.antonyms.split(',').map((s: string) => s.trim()) : [],
                        origin: row.origin || "",
                        audioUrl: row.audioUrl || "",
                        isFromAPI: row.isFromAPI === 'true',
                        isOnline: row.isOnline === 'true',
                        verbForms: row.verbForms ? JSON.parse(row.verbForms) : null,
                        relatedWords: row.relatedWords ? JSON.parse(row.relatedWords) : null,
                        createdAt: new Date().toISOString(),
                        userId: 'bulk-import',
                    }));

                    if (vocabularies.length > 0) {
                        setLoading(true);
                        setUploadStatus("Uploading CSV Data...");
                        try {
                            await uploadDataInChunks(vocabularies, 'vocabularies');
                            toast.success(`Uploaded ${vocabularies.length} vocabularies`);
                            setUploadStatus("Completed");
                        } catch (e) {
                            toast.error("Upload Failed");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            });
        } else {
            toast.error("Please upload a CSV or JSON file");
        }
    };

    const handleResourceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (fileExtension === 'json') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    const resources = Array.isArray(json) ? json : [json];

                    setLoading(true);
                    setUploadStatus("Uploading JSON Data...");
                    await uploadDataInChunks(resources, 'resources');
                    toast.success(`Uploaded ${resources.length} resources`);
                    setUploadStatus("Completed");
                } catch (error) {
                    toast.error("Failed to parse JSON file");
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsText(file);
        } else if (fileExtension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    const resources = results.data.map((row: any) => ({
                        title: row.title || "",
                        description: row.description || "",
                        imageUrl: row.imageUrl || "",
                        thumbnailUrl: row.thumbnailUrl || "",
                        userId: row.userId || 'bulk-import',
                        createdAt: new Date().toISOString(),
                    }));

                    if (resources.length > 0) {
                        setLoading(true);
                        setUploadStatus("Uploading CSV Data...");
                        try {
                            await uploadDataInChunks(resources, 'resources');
                            toast.success(`Uploaded ${resources.length} resources`);
                            setUploadStatus("Completed");
                        } catch (e) {
                            toast.error("Upload Failed");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            });
        } else {
            toast.error("Please upload a CSV or JSON file");
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Backend Data Management</CardTitle>
                    <CardDescription>Manage Vocabularies, Resources, and Users via PostgreSQL Backend</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="vocabulary" className="gap-2">
                                Vocabulary
                                {counts.vocabulary > 0 && <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{counts.vocabulary}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="gap-2">
                                Resources
                                {counts.resources > 0 && <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{counts.resources}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="users" className="gap-2">
                                Users
                                {counts.users > 0 && <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{counts.users}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="upload">Upload Data</TabsTrigger>
                        </TabsList>

                        {/* Actions Toolbar (Visible for non-upload tabs) */}
                        {activeTab !== 'upload' && (
                            <div className="flex justify-between items-center my-4">
                                <div className="flex gap-2 items-center">
                                    <h3 className="text-lg font-medium capitalize">{activeTab}</h3>
                                    <span className="text-sm text-neutral-500">
                                        (Showing {results.length} of {activeTab === 'vocabulary' ? counts.vocabulary : activeTab === 'resources' ? counts.resources : counts.users})
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {selectedIds.size > 0 && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                                            <Trash className="w-4 h-4 mr-2" />
                                            Delete Selected ({selectedIds.size})
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline" onClick={handleSearch}>
                                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                    <Button size="sm" onClick={openAddDialog}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Search Bar Area */}
                        {activeTab === 'vocabulary' && (
                            <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Search Query</Label>
                                    <Input placeholder="Search word..." value={query} onChange={(e) => setQuery(e.target.value)} />
                                </div>
                                <div className="w-48 space-y-2">
                                    <Label>Part of Speech</Label>
                                    <Select value={selectedPos} onValueChange={setSelectedPos}>
                                        <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {VALID_POS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pb-2">
                                    <Switch id="regex" checked={isRegex} onCheckedChange={setIsRegex} />
                                    <Label htmlFor="regex">Regex</Label>
                                </div>
                                <Button onClick={handleSearch} disabled={loading}>Search</Button>
                            </div>
                        )}
                        {(activeTab === 'resources' || activeTab === 'users') && (
                            <div className="flex gap-4 mb-4">
                                <Input
                                    placeholder={`Search ${activeTab}...`}
                                    value={activeTab === 'resources' ? resourceQuery : userQuery}
                                    onChange={(e) => activeTab === 'resources' ? setResourceQuery(e.target.value) : setUserQuery(e.target.value)}
                                    className="max-w-md"
                                />
                                <Button onClick={handleSearch} disabled={loading}>Search</Button>
                            </div>
                        )}

                        {/* Shared Table Component */}
                        {activeTab !== 'upload' && (
                            <div className="border rounded-md max-h-[600px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={results.length > 0 && selectedIds.size === results.length}
                                                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                                />
                                            </TableHead>
                                            {activeTab === 'vocabulary' && (
                                                <>
                                                    <TableHead>Word</TableHead>
                                                    <TableHead>Meaning</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Explanation</TableHead>
                                                </>
                                            )}
                                            {activeTab === 'resources' && (
                                                <>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Created</TableHead>
                                                </>
                                            )}
                                            {activeTab === 'users' && (
                                                <>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Role</TableHead>
                                                </>
                                            )}
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center h-24">No items found</TableCell></TableRow>
                                        ) : (
                                            results.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedIds.has(item.id)}
                                                            onCheckedChange={() => toggleSelection(item.id)}
                                                        />
                                                    </TableCell>
                                                    {activeTab === 'vocabulary' && (
                                                        <>
                                                            <TableCell className="font-medium">{item.english}</TableCell>
                                                            <TableCell>{item.bangla}</TableCell>
                                                            <TableCell>{item.partOfSpeech}</TableCell>
                                                            <TableCell className="max-w-xs truncate" title={item.explanation}>{item.explanation}</TableCell>
                                                        </>
                                                    )}
                                                    {activeTab === 'resources' && (
                                                        <>
                                                            <TableCell className="font-medium">{item.title}</TableCell>
                                                            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                                                            <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</TableCell>
                                                        </>
                                                    )}
                                                    {activeTab === 'users' && (
                                                        <>
                                                            <TableCell>{item.email}</TableCell>
                                                            <TableCell>{item.displayName}</TableCell>
                                                            <TableCell>{item.role}</TableCell>
                                                        </>
                                                    )}
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Upload Tab */}
                        <TabsContent value="upload" className="space-y-6 pt-4">
                            {/* Vocabulary Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        Upload Vocabularies
                                    </CardTitle>
                                    <CardDescription>
                                        Upload vocabulary data in CSV or JSON format
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <Button variant="outline" onClick={downloadVocabularyTemplate}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download CSV Template
                                        </Button>
                                        <div className="relative flex-1">
                                            <Input
                                                type="file"
                                                accept=".csv,.json"
                                                onChange={handleVocabularyUpload}
                                                className="hidden"
                                                id="vocab-upload"
                                                disabled={loading}
                                            />
                                            <Button asChild disabled={loading} className="w-full">
                                                <label htmlFor="vocab-upload" className="cursor-pointer">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload CSV/JSON File
                                                </label>
                                            </Button>
                                        </div>
                                    </div>
                                    {loading && uploadStatus && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{uploadStatus}</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resource Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        Upload Resources
                                    </CardTitle>
                                    <CardDescription>
                                        Upload resource data in CSV or JSON format
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <Button variant="outline" onClick={downloadResourceTemplate}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download CSV Template
                                        </Button>
                                        <div className="relative flex-1">
                                            <Input
                                                type="file"
                                                accept=".csv,.json"
                                                onChange={handleResourceUpload}
                                                className="hidden"
                                                id="resource-upload"
                                                disabled={loading}
                                            />
                                            <Button asChild disabled={loading} className="w-full">
                                                <label htmlFor="resource-upload" className="cursor-pointer">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload CSV/JSON File
                                                </label>
                                            </Button>
                                        </div>
                                    </div>
                                    {loading && uploadStatus && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{uploadStatus}</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* General Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        <DialogDescription>
                            {activeTab === 'vocabulary' ? 'Enter word details' : activeTab === 'resources' ? 'Enter resource info' : 'User details'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {activeTab === 'vocabulary' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>English Word</Label>
                                        <Input value={formData.english || ''} onChange={e => setFormData({ ...formData, english: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bangla Meaning</Label>
                                        <Input value={formData.bangla || ''} onChange={e => setFormData({ ...formData, bangla: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Part of Speech</Label>
                                        <Select value={formData.partOfSpeech} onValueChange={v => setFormData({ ...formData, partOfSpeech: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {VALID_POS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pronunciation</Label>
                                        <Input value={formData.pronunciation || ''} onChange={e => setFormData({ ...formData, pronunciation: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Explanation</Label>
                                    <Input value={formData.explanation || ''} onChange={e => setFormData({ ...formData, explanation: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Synonyms (comma separated)</Label>
                                        <Input
                                            value={Array.isArray(formData.synonyms) ? formData.synonyms.join(', ') : formData.synonyms || ''}
                                            onChange={e => setFormData({ ...formData, synonyms: e.target.value.split(',').map((s: string) => s.trim()) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Antonyms (comma separated)</Label>
                                        <Input
                                            value={Array.isArray(formData.antonyms) ? formData.antonyms.join(', ') : formData.antonyms || ''}
                                            onChange={e => setFormData({ ...formData, antonyms: e.target.value.split(',').map((s: string) => s.trim()) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Examples (JSON array of {`{ en: "...", bn: "..." }`})</Label>
                                    <Input
                                        value={typeof formData.examples === 'string' ? formData.examples : JSON.stringify(formData.examples || [])}
                                        onChange={e => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setFormData({ ...formData, examples: parsed });
                                            } catch (err) {
                                                setFormData({ ...formData, examples: e.target.value });
                                            }
                                        }}
                                        placeholder='[{"en": "Hello", "bn": "ওহে"}]'
                                    />
                                    <span className='text-xs text-muted-foreground'>Enter valid JSON array</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Origin</Label>
                                        <Input value={formData.origin || ''} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Audio URL</Label>
                                        <Input value={formData.audioUrl || ''} onChange={e => setFormData({ ...formData, audioUrl: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="isFromAPI" checked={formData.isFromAPI || false} onCheckedChange={c => setFormData({ ...formData, isFromAPI: c })} />
                                        <Label htmlFor="isFromAPI">Is From API</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="isOnline" checked={formData.isOnline || false} onCheckedChange={c => setFormData({ ...formData, isOnline: c })} />
                                        <Label htmlFor="isOnline">Is Online</Label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Verb Forms (JSON)</Label>
                                    <Input
                                        value={typeof formData.verbForms === 'string' ? formData.verbForms : JSON.stringify(formData.verbForms || {})}
                                        onChange={e => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setFormData({ ...formData, verbForms: parsed });
                                            } catch (err) {
                                                setFormData({ ...formData, verbForms: e.target.value });
                                            }
                                        }}
                                        placeholder='{"base": "...", "v2": "..."}'
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Related Words (JSON)</Label>
                                    <Input
                                        value={typeof formData.relatedWords === 'string' ? formData.relatedWords : JSON.stringify(formData.relatedWords || [])}
                                        onChange={e => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setFormData({ ...formData, relatedWords: parsed });
                                            } catch (err) {
                                                setFormData({ ...formData, relatedWords: e.target.value });
                                            }
                                        }}
                                        placeholder='[{"word": "...", "meaning": "..."}]'
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'resources' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Image URL (Optional)</Label>
                                        <Input value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Thumbnail URL (Optional)</Label>
                                        <Input value={formData.thumbnailUrl || ''} onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'users' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={!!editingItem} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input value={formData.displayName || ''} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Photo URL</Label>
                                    <Input value={formData.photoURL || ''} onChange={e => setFormData({ ...formData, photoURL: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default BackendTest;
