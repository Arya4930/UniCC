import Image from "next/image"

export default function Chepu() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Image
                src="/chepu/chepu_winking.png"
                alt="Chepu winking"
                width={300}
                height={300}
                className="h-auto w-48 object-contain"
                priority
            />
            <p className="text-sm font-medium text-muted-foreground">
                A little wink from Chepu for the semester ahead!
            </p>
        </div>
    )
}