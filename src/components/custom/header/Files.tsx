import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import {
    File,
    FileText,
    FileArchive,
    FileVideo,
    FileImage,
    FileSpreadsheet,
    FileCode,
    Download,
    Trash2
} from "lucide-react";
import { API_BASE } from "../Main";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";

export default function Files() {
    const userID = localStorage.getItem("username") || "";
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const calcUsed = (files: any[]) =>
        files.reduce((acc, f) => acc + (f.size || 0), 0);


    const fetchFiles = async () => {
        setLoadingFiles(true);
        try {
            const res = await fetch(`${API_BASE}/api/files/fetch/${userID}`);
            if (!res.ok) throw new Error("Failed to fetch files");
            const data = await res.json();
            setFiles(data);
            console.log("Fetched files:", data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingFiles(false);
        }
    }

    const deleteFile = async (fileID: string) => {
        setIsDeleting(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/files/delete/${userID}/${encodeURIComponent(fileID)}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error("Failed to delete file");

            setFiles(prev => prev.filter(file => file.fileID !== fileID));
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getDownloadUrl = (fileID) =>
        `https://uniccassets.aryaslocalserver.online/${fileID}?response-content-disposition=attachment`;

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDrop = async (incomingFiles: File[]) => {
        const uid = localStorage.getItem("username") || "";
        if (!uid) return;

        const tempFiles = incomingFiles.map(f => ({
            fileID: `temp-${f.name}`,
            name: f.name,
            size: f.size,
            extension: f.name.split('.').pop() || "",
            expiresAt: new Date().toISOString(),
            isUploading: true
        }));

        setFiles(prev => [...prev, ...tempFiles]);

        for (const file of incomingFiles) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch(
                    `${API_BASE}/api/files/upload/${uid}`,
                    { method: "POST", body: formData }
                );

                if (!res.ok) throw new Error("Upload failed");
            } catch (err) {
                console.error(err);
            }
        }

        fetchFiles();
    };

    const handleDownload = async (file) => {
        try {
            const res = await fetch(`${API_BASE}/api/files/download/${userID}/${encodeURIComponent(file.fileID)}`);
            if (!res.ok) throw new Error("Failed to download file");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between font-semibold 
                       text-xl text-gray-800 dark:text-gray-200 midnight:text-gray-100"
            >
                <span>Uploaded Files</span>

                <div className="flex items-center gap-3">
                    {files.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md
                        bg-blue-100 dark:bg-blue-900 midnight:bg-blue-900
                        text-blue-700 dark:text-blue-300 midnight:text-blue-300">
                            {formatSize(calcUsed(files))} / 5 MB
                        </span>
                    )}

                    {open ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </div>
            </button>

            <div className={`transition-all duration-300 ${open ? "max-h-[500px] overflow-y-auto" : "max-h-0 overflow-hidden"}`}>
                {loadingFiles ? (
                    <p className="text-gray-500 dark:text-gray-400 midnight:text-gray-300">Loading…</p>
                ) : (
                    <>
                        <Dropzone
                            maxFiles={10}
                            onDrop={handleDrop}
                            onError={console.error}
                            className="w-full h-[28px] my-3"
                        >
                            <DropzoneEmptyState />
                            <DropzoneContent />
                        </Dropzone>

                        {files.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 midnight:text-gray-300">
                                No files uploaded
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {files.map((file, index) => {
                                    const filename = file.name.replace(/^[^-]+-/, "");
                                    const formatTimeLeft = (expiresAt: string) => {
                                        const diff = new Date(expiresAt).getTime() - Date.now();

                                        if (diff <= 0) return "Expired";

                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                        const secs = Math.floor((diff % (1000 * 60)) / 1000);

                                        const parts = [];
                                        if (hours > 0) parts.push(`${hours}h`);
                                        if (mins > 0 || hours > 0) parts.push(`${mins}m`);
                                        parts.push(`${secs}s`);

                                        return parts.join(" ");
                                    };
                                    const timeLeft = formatTimeLeft(file.expiresAt);

                                    return (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between gap-3 
               px-3 py-2 rounded-lg transition
               bg-gray-200 dark:bg-slate-800 midnight:bg-gray-900
               hover:bg-gray-300 dark:hover:bg-slate-700 midnight:hover:bg-gray-800"
                                        >
                                            <div className="flex items-start gap-3 flex-1">
                                                {getFileIcon(file.extension)}

                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-100 
                                                                truncate max-w-[140px] sm:max-w-[220px] md:max-w-[260px]">
                                                        {filename}
                                                    </span>

                                                    <div className="flex gap-2 mt-1 flex-wrap">
                                                        <span className="text-[9px] md:text-[10px] font-medium px-2 py-0.5 rounded-md
                                                            bg-gray-300 dark:bg-gray-700 midnight:bg-gray-800
                                                            text-gray-700 dark:text-gray-200 midnight:text-gray-200">
                                                            {formatSize(file.size)}
                                                        </span>

                                                        {(timeLeft !== "Expired" || file.isUploading) && (
                                                            <span className="text-[9px] md:text-[10px] font-medium px-2 py-0.5 rounded-md
                                                        bg-blue-200 dark:bg-blue-900 midnight:bg-blue-900
                                                        text-blue-700 dark:text-blue-300 midnight:text-blue-300">
                                                                {file.isUploading ? "Uploading…" : timeLeft}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {!file.isUploading && (
                                                    <>
                                                        <a
                                                            href={getDownloadUrl(file.fileID)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 rounded-md border border-transparent hover:border-blue-500 
                                                            text-blue-600 dark:text-blue-400 midnight:text-blue-300"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </a>
                                                        
                                                        <button
                                                            onClick={() => handleDownload(file)}
                                                            className="p-1 rounded-md border border-transparent hover:border-blue-500 
                                                                text-blue-600 dark:text-blue-400 midnight:text-blue-300"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteFile(file.fileID)}
                                                            disabled={isDeleting}
                                                            className={`p-1 rounded-md border transition
                                                        ${isDeleting
                                                                    ? "opacity-50 cursor-not-allowed border-gray-500"
                                                                    : "text-red-600 dark:text-red-400 midnight:text-red-400 border-red-500 hover:bg-red-200 dark:hover:bg-red-700 midnight:hover:bg-red-800"
                                                                }`}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const getFileIcon = (ext: string) => {
    if (!ext) return <File className="w-5 h-5 text-gray-500" />;
    const e = ext.toLocaleLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(e)) return <FileImage className="w-5 h-5 text-blue-600" />;
    if (["pdf"].includes(e)) return <FileText className="w-5 h-5 text-red-600" />;
    if (["zip", "rar", "7z"].includes(e)) return <FileArchive className="w-5 h-5 text-yellow-600" />;
    if (["mp4", "mov", "avi"].includes(e)) return <FileVideo className="w-5 h-5 text-purple-600" />;
    if (["xlsx", "xls", "csv"].includes(e)) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (["js", "ts", "json", "html", "css", "py"].includes(e)) return <FileCode className="w-5 h-5 text-indigo-600" />;
    return <File className="w-5 h-5" />;
}