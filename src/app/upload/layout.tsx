export const metadata = {
    title: "Upload Files - Unicc",
    description: "Upload Now, access later",
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {children}
        </div>
    );
}