
import { useEffect, useState } from "react";
import NoContentFound from "../NoContentFound";
import ExamSchedule from "./SchduleDisplay";
import VitolDisplay, { VitolUserPassForm } from "./vitolDisplay";

export default function ScheduleSubTab({ data, handleScheduleFetch, vitolData, handleFetchVitol, setVitolData }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        const vitol_username = localStorage.getItem("vitol_username");
        const vitol_password = localStorage.getItem("vitol_password");

        if (vitol_username) setUsername(vitol_username);
        if (vitol_password) setPassword(vitol_password);
    }, []);

    return (
        <>
            <ExamSchedule data={data} handleScheduleFetch={handleScheduleFetch} />
            {(username && password) ? (
                <VitolDisplay vitolData={vitolData} handleFetchVitol={handleFetchVitol} setVitolData={setVitolData} />
            ) : (
                <VitolUserPassForm handleFetchVitol={handleFetchVitol} />
            )}
        </>
    );
}