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
  slNo: string | null,
  courseCode: string,
  courseTitle: string,
  courseType: string | null,
  slotName: string,
  faculty: string | null,
  registrationDate: string | null,
  attendanceDate: string | null,
  attendedClasses: number | null,
  totalClasses: number | null,
  attendancePercentage?: string | null | undefined,
  viewLink: string | detailed[] | null,
  slotVenue?: string | null | undefined,
  classId?: string | null | undefined,
  credits?: string | null | undefined,
  category?: string | null | undefined,
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