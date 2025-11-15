export type courseItem = {
    slNo: string,
    course: string,
    courseCode: string,
    LTPJC: string,
    category: string,
    classId: string,
    slotVenue: string,
    facultyDetails: string,
}

type detailed = {
    date: string,
    status: string
}

export type attendanceItem = {
    slNo: string,
    courseCode: string,
    courseTitle: string,
    courseType: string,
    slotName: string,
    faculty: string,
    registrationDate: string,
    attendanceDate: string,
    attendedClasses: number,
    totalClasses: number,
    attendancePercentage: string,
    viewLink: string | detailed[] | null,
    classId?: string | null,
    credits?: string | null,
    slotVenue?: string | null,
    category?: string | null,
}

export type attendanceRes = {
    semesterId?: string,
    attendance?: attendanceItem[],
    error?: string,
}

type ODEntry = {
  title: string;
  type: "LAB" | "TH";
  hours: number;
};

type ODListItem = {
  date: string;
  courses: ODEntry[];
  total: number;
};

type ODListRaw = {
  [date: string]: ODEntry[];
};