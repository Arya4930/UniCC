"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/mousewheel";
import { Mousewheel } from "swiper/modules";
import { useRef, useState, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";

const allVideos = [
    "https://uniccassets.aryaslocalserver.online/reels/reel_1.mp4",
//    "https://uniccassets.aryaslocalserver.online/reels/reel_2.mp4",
    "https://uniccassets.aryaslocalserver.online/reels/reel_3.mp4",
    // "https://uniccassets.aryaslocalserver.online/reels/reel_5.mp4",
    "https://uniccassets.aryaslocalserver.online/reels/reel_6.mp4",
    "https://uniccassets.aryaslocalserver.online/reels/reel_7.mp4",
    "https://uniccassets.aryaslocalserver.online/reels/reel_8.mp4"
];

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function ReelsScroller() {
    const refs = useRef<(HTMLVideoElement | null)[]>([]);
    const [muted, setMuted] = useState(true);

    // Memoize shuffled order so it stays the same for one render
    const videos = useMemo(() => shuffleArray(allVideos), []);

    const toggleMute = () => {
        setMuted((prev) => !prev);
        refs.current.forEach((vid) => {
            if (vid) vid.muted = !vid.muted;
        });
    };

    return (
        <div className="relative flex items-center justify-center">
            <Swiper
                direction="vertical"
                speed={800}
                mousewheel
                modules={[Mousewheel]}
                loop={true}
                slidesPerView={1}
                spaceBetween={20}
                className="w-56 h-[400px] rounded-2xl shadow-2xl overflow-hidden bg-black"
                onSlideChange={(swiper) => {
                    refs.current.forEach((vid, idx) => {
                        if (!vid) return;
                        if (idx === swiper.activeIndex) {
                            vid.currentTime = 0;
                            vid.play().catch(() => { });
                        } else {
                            vid.pause();
                        }
                    });
                }}
            >
                {videos.map((src, i) => (
                    <SwiperSlide
                        key={i}
                        className="flex items-center justify-center bg-black"
                    >
                        <video
                            ref={(el) => {
                                refs.current[i] = el;
                            }}
                            src={src}
                            loop
                            muted={muted}
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover rounded-2xl"
                            onCanPlay={(e) => i === 0 && e.currentTarget.play()}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            <button
                onClick={toggleMute}
                className="absolute z-10 bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition"
            >
                {muted ? (
                    <VolumeX className="w-5 h-5" />
                ) : (
                    <Volume2 className="w-5 h-5" />
                )}
            </button>
        </div>
    );
}
