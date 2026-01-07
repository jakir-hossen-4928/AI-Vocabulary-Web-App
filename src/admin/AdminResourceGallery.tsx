import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GrammarImage } from "@/types/grammar";
import { useResourcesSimple, useResourceMutations } from "@/hooks/useResources";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    MoreVertical,
    LayoutGrid,
    List as ListIcon,
    Calendar as CalendarIcon,
    Eye,
    ArrowUpDown,
    X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { confirmAction } from "@/utils/sweetAlert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CachedImage } from "@/components/CachedImage";
import { ResourcePlaceholder } from "@/components/ResourcePlaceholder";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

type ViewMode = "grid" | "list";
type SortOrder = "newest" | "oldest";

export default function AdminResourceGallery() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const { data: images = [], isLoading: loading } = useResourcesSimple();
    const { deleteResource } = useResourceMutations();
    const listRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [date, setDate] = useState<Date | undefined>(undefined);

    // Column count state for responsive grid virtualization
    const [columns, setColumns] = useState(1);

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1280) setColumns(4);      // xl
            else if (window.innerWidth >= 1024) setColumns(3); // lg
            else if (window.innerWidth >= 640) setColumns(2);  // sm
            else setColumns(1);
        };

        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirmAction(
            'Are you sure?',
            "Are you sure you want to delete this resource?",
            'Yes, delete it!'
        );

        if (isConfirmed) {
            await deleteResource.mutateAsync(id);
        }
    };

    const filteredImages = useMemo(() => {
        return images
            .filter((img) => {
                const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesDate = date ? isSameDay(new Date(img.createdAt), date) : true;
                return matchesSearch && matchesDate;
            })
            .sort((a, b) => {
                switch (sortOrder) {
                    case "newest":
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case "oldest":
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    default:
                        return 0;
                }
            });
    }, [images, searchQuery, date, sortOrder]);

    // Chunk data for grid view
    const gridRows = useMemo(() => {
        if (viewMode !== "grid") return [];
        const rows = [];
        for (let i = 0; i < filteredImages.length; i += columns) {
            rows.push(filteredImages.slice(i, i + columns));
        }
        return rows;
    }, [filteredImages, columns, viewMode]);

    const count = viewMode === "grid" ? gridRows.length : filteredImages.length;

    const virtualizer = useWindowVirtualizer({
        count,
        estimateSize: () => viewMode === "grid" ? 320 : 70, // Estimate row height
        overscan: 5,
        scrollMargin: listRef.current?.offsetTop ?? 0,
    });

    const virtualItems = virtualizer.getVirtualItems();

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-background pb-8 overflow-x-hidden" ref={listRef}>
            {/* Header Section */}
            <div className="bg-background border-b sticky top-0 z-30 bg-opacity-80 backdrop-blur-md">
                <div className="container mx-auto py-6 px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground">Resource Manager</h1>
                            <p className="text-muted-foreground font-medium">
                                Create, manage, and publish your educational content
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Date Picker */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal h-11 border-input shadow-sm relative group",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        {date && (
                                            <div
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full cursor-pointer opacity-60 hover:opacity-100 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDate(undefined);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </div>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                                <SelectTrigger className="w-[160px] h-11 bg-background border-input shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Sort By" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="bg-muted p-1 rounded-lg flex items-center border">
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                    className="h-8 w-8 rounded-md"
                                    title="Grid View"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                    className="h-8 w-8 rounded-md"
                                    title="List View"
                                >
                                    <ListIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                onClick={() => navigate("/admin/resources/add")}
                                className="shadow-lg shadow-primary/20 font-bold h-11"
                                size="lg"
                            >
                                <Plus className="mr-2 h-5 w-5" /> New Resource
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 max-w-md relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search resources by title..."
                            className="pl-10 h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4 max-w-7xl">
                {loading ? (
                    <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <LoadingSpinner className="h-10 w-10 text-primary" />
                        <p className="animate-pulse font-medium">Loading your library...</p>
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                            {(searchQuery || date) ? (
                                <Search className="h-8 w-8 opacity-50" />
                            ) : (
                                <CalendarIcon className="h-8 w-8 opacity-50" />
                            )}
                        </div>
                        <p className="text-xl font-bold">No resources found</p>
                        <p className="text-sm">
                            {(searchQuery || date) ? "Try adjusting your filters." : "Add a new resource to get started."}
                        </p>
                        {(searchQuery || date) && (
                            <Button variant="link" onClick={() => { setSearchQuery(""); setDate(undefined); }}>
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {viewMode === "grid" ? (
                            <div
                                style={{
                                    height: `${virtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {virtualItems.map((virtualRow) => {
                                    const rowImages = gridRows[virtualRow.index];
                                    return (
                                        <div
                                            key={virtualRow.key}
                                            data-index={virtualRow.index}
                                            ref={virtualizer.measureElement}
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-6 absolute top-0 left-0 w-full"
                                            style={{
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            {rowImages.map((img) => (
                                                <Card key={img.id} className="group flex flex-col overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full">
                                                    <div className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer" onClick={() => navigate(`/admin/resources/edit/${img.id}`)}>
                                                        {img.imageUrl ? (
                                                            <div className="w-full h-full relative">
                                                                <CachedImage
                                                                    src={img.thumbnailUrl || img.imageUrl}
                                                                    alt=""
                                                                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
                                                                    loading="lazy"
                                                                />
                                                                <CachedImage
                                                                    src={img.imageUrl}
                                                                    alt={img.title}
                                                                    className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <ResourcePlaceholder title={img.title} />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                                        {/* Float Actions */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-0 shadow-lg">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/resources/${img.slug || img.id}`); }}>
                                                                        <Eye className="mr-2 h-4 w-4" /> View Live
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/resources/edit/${img.id}`); }}>
                                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col flex-1 p-5 sm:p-6">
                                                        <h3 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                            {img.title}
                                                        </h3>
                                                        <div className="mt-auto pt-4 flex items-center justify-between text-muted-foreground text-xs font-medium">
                                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                <CalendarIcon className="h-3 w-3" />
                                                                {format(new Date(img.createdAt), "MMM d, yyyy")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30 text-xs uppercase tracking-wider">
                                            <TableHead className="w-[80px]">Image</TableHead>
                                            <TableHead>Title & Slug</TableHead>
                                            <TableHead className="w-[150px]">Created</TableHead>
                                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody
                                        style={{
                                            height: `${virtualizer.getTotalSize()}px`,
                                            position: 'relative'
                                        }}
                                    >
                                        {virtualItems.map((virtualRow) => {
                                            const img = filteredImages[virtualRow.index];
                                            return (
                                                <TableRow
                                                    key={img.id}
                                                    data-index={virtualRow.index}
                                                    ref={virtualizer.measureElement}
                                                    className="group hover:bg-muted/30 transition-colors absolute w-full flex items-center"
                                                    style={{
                                                        transform: `translateY(${virtualRow.start}px)`,
                                                    }}
                                                >
                                                    <TableCell className="w-[80px] shrink-0">
                                                        <div className="h-12 w-20 rounded-lg overflow-hidden bg-muted relative border">
                                                            {img.imageUrl ? (
                                                                <CachedImage
                                                                    src={img.thumbnailUrl || img.imageUrl}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-[8px] text-muted-foreground bg-muted">
                                                                    No Img
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="flex-1">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-base group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/admin/resources/edit/${img.id}`)}>
                                                                {img.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                /{img.slug || img.id}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="w-[150px] shrink-0">
                                                        <div className="text-sm font-medium text-muted-foreground">
                                                            {format(new Date(img.createdAt), "MMM d, yyyy")}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="w-[100px] shrink-0 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => navigate(`/resources/${img.slug || img.id}`)}>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Live
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => navigate(`/admin/resources/edit/${img.id}`)}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(img.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
