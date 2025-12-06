"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Dropzone,
    DropzoneContent,
    DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { API_BASE } from "@/components/custom/Main";

export default function UploadPage() {
    const [userID, setUserID] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleDrop = (incomingFiles: File[]) => {
        setFiles(incomingFiles);
    };

    const handleUpload = async () => {
        if (!userID || files.length === 0) {
            setMessage("Enter VTOP ID and choose file(s)");
            return;
        }

        setUploading(true);
        setMessage("");

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch(
                    `${API_BASE}/api/files/upload/${userID}`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!res.ok) throw new Error("Upload failed");
                setMessage(`Uploaded: ${file.name}`);
            } catch (err) {
                console.error(err);
                setMessage(`Failed: ${file.name}`);
            }
        }

        setUploading(false);
    };

    return (
        <div className="flex flex-col items-center p-6 gap-4 max-w-md mx-auto w-full">
            <h1 className="text-xl font-bold mb-2">Upload Files</h1>

            <div className="flex w-full items-center gap-2">
                <Input
                    placeholder="Enter VTOP ID"
                    className="w-full"
                    value={userID}
                    onChange={(e) => setUserID(e.target.value)}
                    disabled={uploading}
                />
                <Button
                    onClick={handleUpload}
                    disabled={!userID || files.length === 0 || uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </Button>
            </div>

            <Dropzone
                maxFiles={10}
                onDrop={handleDrop}
                onError={console.error}
                src={files}
                disabled={uploading}
                className="w-full"
            >
                <DropzoneEmptyState text="Drag & drop your files here" />
                <DropzoneContent />
            </Dropzone>

            {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </div>
    );
}
