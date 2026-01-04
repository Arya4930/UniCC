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
import Footer from "@/components/custom/footer/Footer";

export default function UploadPage() {
    const [userID, setUserID] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [email, setEmail] = useState("");
    const [mailSending, setMailSending] = useState(false);
    const [mailTitle, setMailTitle] = useState("Files from UniCC");

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
                    { method: "POST", body: formData }
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

    const handleSendMail = async () => {
        if (!email || files.length === 0) {
            setMessage("Enter Mail ID and choose file(s)");
            return;
        }

        try {
            setMailSending(true);
            setMessage("");

            const formData = new FormData();
            formData.append("email", email);
            formData.append("subject", mailTitle);
            files.forEach((file) => formData.append("files", file));

            const res = await fetch(
                `${API_BASE}/api/files/mail/send`,
                { method: "POST", body: formData }
            );

            if (!res.ok) throw new Error("Mail send failed");
            setMessage("Files sent to mail successfully");
            setFiles([]);
        } catch (err) {
            console.error(err);
            setMessage("Failed to send files to mail");
        } finally {
            setMailSending(false);
        }
    }

    return (
        <div>
            <main className="flex flex-col min-h-screen items-center p-6 gap-4 max-w-md mx-auto w-full">
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
                        {uploading ? "Uploading to UniCC..." : "Upload to UniCC"}
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
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </Dropzone>

                <hr className="w-full my-4 border-gray-300 dark:border-gray-700 midnight:border-gray-700" />

                <div className="w-full space-y-2">
                    <Input
                        placeholder="Enter Mail ID"
                        className="w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={mailSending}
                    />

                    <div className="flex w-full items-center gap-2">
                        <Input
                            placeholder="Mail title (subject)"
                            className="w-full"
                            value={mailTitle}
                            onChange={(e) => setMailTitle(e.target.value)}
                            disabled={mailSending}
                        />
                        <Button
                            onClick={handleSendMail}
                            disabled={!email || files.length === 0 || mailSending}
                        >
                            {mailSending ? "Sending to Mail..." : "Send to Mail"}
                        </Button>
                    </div>
                </div>

                {message && (
                    <p className="text-sm text-gray-600 mt-2 text-center">{message}</p>
                )}

                <p className="text-xs text-center text-gray-600 dark:text-gray-400 midnight:text-gray-500 max-w-sm mt-8">
                    This page is not affiliated with VIT, VTOP or any of their affiliates. Files are securely stored
                    in Backblaze B2 for temporary transfer only — not long-term cloud storage.
                    Your VTOP ID is encrypted before storage. Maximum upload limit is 5 MB,
                    and all files are automatically deleted after 24 hours.
                </p>
                <p className="text-xs text-center text-gray-600 dark:text-gray-400 midnight:text-gray-500 max-w-sm mt-2">
                    If sending to mail, make sure to check your spam/junk folder in case the email doesn't appear in your inbox.
                </p>
            </main>

            <Footer isLoggedIn={false} />
        </div>
    );
}
