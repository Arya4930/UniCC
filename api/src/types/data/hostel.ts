export type hostel = {
    gender?: string,
    isHosteller?: boolean,
    blockName?: string,
    roomNo?: string,
    messInfo?: string,
}

export type leaveItem = {
    leaveId: string,
    visitPlace?: string,
    reason?: string,
    leaveType?: string,
    from?: string,
    to?: string,
    status?: string,
    remarks?: string,
}