import Image from "next/image";

export default function NoContentFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Image
                src="/chepu/empty_page_chepu.png"
                alt="Empty State"
                width={200}
                height={200}
                className="mb-4 opacity-90"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                No content available yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400 mt-1">
                Try refreshing or check back later.
            </p>
        </div>
    );
}