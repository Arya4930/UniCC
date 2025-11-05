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
    attendedClasses: string,
    totalClasses: string,
    attendancePercentage: string,
    viewLink: string | detailed[] | null,
    classId?: string | null,
    credits?: string | null,
    slotVenue?: string | null,
    category?: string | null,
}