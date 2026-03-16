
import { useEffect, useState } from "react";
import NoContentFound from "../NoContentFound";
import ExamSchedule from "./SchduleDisplay";
import VitolDisplay, { VitolUserPassForm } from "./VitolDisplay";

export default function ScheduleSubTab({ data, handleScheduleFetch }) {
    return (
        <>
            <ExamSchedule data={data} handleScheduleFetch={handleScheduleFetch} />
            {/* {(username && password) ? (
                <VitolDisplay vitolData={vitolData} handleFetchVitol={handleFetchVitol} setVitolData={setVitolData} />
            ) : (
                <VitolUserPassForm handleFetchVitol={handleFetchVitol} />
            )} */}
        </>
    );
}