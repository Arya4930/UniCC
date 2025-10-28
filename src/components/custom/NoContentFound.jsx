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
        </div>
    );
}