"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandInput,
} from "@/components/ui/command";
import {
  Calendar,
  LayoutGrid,
  RefreshCcw,
  UploadCloud,
  GraduationCap,
  BedDouble,
  EyeOff,
  Eye,
} from "lucide-react";

export default function CommandPalette({
  activeTab,
  setActiveTab,
  setActiveAttendanceSubTab,
  setActiveSubTab,
  setHostelActiveSubTab,
  handleReloadRequest,
  CGPAHidden,
  setCGPAHidden,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveAttendanceSubTab: (tab: string) => void;
  setActiveSubTab: (tab: string) => void;
  setHostelActiveSubTab: (tab: string) => void;
  handleReloadRequest: () => void;
  CGPAHidden: boolean;
  setCGPAHidden: (hidden: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const actions = useMemo(
    () => [
      {
        id: "go-attendance",
        label: "Go to Attendance",
        group: "Navigate",
        icon: LayoutGrid,
        shortcut: "1",
        run: () => setActiveTab("attendance"),
      },
      {
        id: "go-exams",
        label: "Go to Exams",
        group: "Navigate",
        icon: GraduationCap,
        shortcut: "2",
        run: () => setActiveTab("exams"),
      },
      {
        id: "go-hostel",
        label: "Go to Hostel",
        group: "Navigate",
        icon: BedDouble,
        shortcut: "3",
        run: () => setActiveTab("hostel"),
      },
      {
        id: "go-calendar",
        label: "Open Attendance Calendar",
        group: "Navigate",
        icon: Calendar,
        shortcut: "A",
        run: () => {
          setActiveTab("attendance");
          setActiveAttendanceSubTab("calendar");
        },
      },
      {
        id: "go-marks",
        label: "Open Marks",
        group: "Navigate",
        icon: GraduationCap,
        shortcut: "M",
        run: () => {
          setActiveTab("exams");
          setActiveSubTab("marks");
        },
      },
      {
        id: "go-mess",
        label: "Open Mess Menu",
        group: "Navigate",
        icon: BedDouble,
        shortcut: "H",
        run: () => {
          setActiveTab("hostel");
          setHostelActiveSubTab("mess");
        },
      },
      {
        id: "reload",
        label: "Reload data",
        group: "Actions",
        icon: RefreshCcw,
        shortcut: "R",
        run: () => handleReloadRequest(),
      },
      {
        id: "upload",
        label: "Open Upload page",
        group: "Actions",
        icon: UploadCloud,
        shortcut: "U",
        run: () => router.push("/upload"),
      },
      {
        id: "toggle-cgpa",
        label: CGPAHidden ? "Show CGPA" : "Hide CGPA",
        group: "Preferences",
        icon: CGPAHidden ? Eye : EyeOff,
        shortcut: "C",
        run: () => setCGPAHidden(!CGPAHidden),
      },
    ],
    [
      CGPAHidden,
      handleReloadRequest,
      router,
      setActiveAttendanceSubTab,
      setActiveSubTab,
      setActiveTab,
      setCGPAHidden,
      setHostelActiveSubTab,
    ]
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof actions>();
    actions.forEach((action) => {
      if (!map.has(action.group)) map.set(action.group, []);
      map.get(action.group)?.push(action);
    });
    return Array.from(map.entries());
  }, [actions]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map(([group, items], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.id}
                    onSelect={() => {
                      action.run();
                      setOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{action.label}</span>
                    {action.shortcut && (
                      <CommandShortcut>{action.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
