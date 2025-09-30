'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function ThemeColorUpdater() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const metaThemeColor = document.querySelector("meta[name='theme-color']");
        if (metaThemeColor) {
            if (resolvedTheme === 'dark') {
                metaThemeColor.setAttribute('content', '#111827');
            } else {
                metaThemeColor.setAttribute('content', '#ffffffff');
            }
        }
    }, [resolvedTheme]);

    return null;
}