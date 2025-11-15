"use client";

import { loadActivityTree } from "@/lib/activit-tree";
import HeatMap from "@uiw/react-heat-map";
import { useState, useEffect, useRef } from "react";

export default function ReloadActivityHeatmap() {
  const tree = loadActivityTree();
  tree.increment();
  const data = tree.toHeatMap();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollLeft = el.scrollWidth;
    }
  }, []);

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  function handleRectEnter(e: React.MouseEvent, dayData: any) {
    const content =
      (dayData?.value ?? dayData?.count)
        ? `${dayData.value ?? dayData.count} reloads on ${dayData.date}`
        : `No reloads on ${dayData.date}`;

    setTooltip({
      visible: true,
      x: e.pageX + 14,
      y: e.pageY - 20,
      content,
    });
  }

  function handleRectMove(e: React.MouseEvent) {
    setTooltip((t) => ({
      ...t,
      x: e.pageX + 14,
      y: e.pageY - 20,
    }));
  }

  function handleRectLeave() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Reload Activity <span className="text-xs text-gray-500">(Yes, this exists for no reason)</span>
      </h2>
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto"
        style={{ direction: "rtl", paddingBottom: 8 }}
      >
        <div
          className="inline-block"
          style={{
            direction: "ltr",
            minWidth: 750,
          }}
        >
          <HeatMap
            value={data}
            startDate={oneYearAgo}
            width={720}
            style={{
              color: "#adbac7",
              "--rhm-rect-active": "#3d8eff",
              display: "block",
              margin: "0 auto",
            }}
            rectProps={{
              rx: 3,
              ry: 3,
              cursor: "pointer",
            }}
            legendCellSize={12}
            legendCellGap={3}
            legendRender={(props) => (
              <rect {...props} y={props.y + 12} rx={3} ry={3} />
            )}
            rectRender={(props, dayData) => (
              <rect
                {...props}
                onMouseEnter={(e) => handleRectEnter(e as any, dayData)}
                onMouseMove={(e) => handleRectMove(e as any)}
                onMouseLeave={handleRectLeave}
              />
            )}
            panelColors={{
              0: "#e8f1ff",
              5: "#c6dbff",
              10: "#99c2ff",
              15: "#6aa8ff",
              20: "#3d8eff",
              30: "#106dff",
              40: "#0846a3",
            }}
          />
        </div>
      </div>

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: Math.min(tooltip.x, window.innerWidth - 200),
            top: tooltip.y,
            pointerEvents: "none",
            background: "rgba(18,22,26,0.95)",
            color: "#e6edf3",
            padding: "6px 10px",
            borderRadius: 6,
            boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
            fontSize: 13,
            zIndex: 9999,
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
