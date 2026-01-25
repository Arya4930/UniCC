
import { useEffect, useState } from "react";
import NoContentFound from "../NoContentFound";
import MarksDisplay from "./marksDislay";
import MoodleDisplay, { MoodleUserPassForm } from "./moodleDisplay";

export default function MarksSubTab({ data, moodleData, handleFetchMoodle, setMoodleData }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        const moodle_username = localStorage.getItem("moodle_username");
        const moodle_password = localStorage.getItem("moodle_password");

        if (moodle_username) setUsername(moodle_username);
        if (moodle_password) setPassword(moodle_password);
    }, []);

    return (
        <>
            <MarksDisplay data={data} />
            {(username && password) ? (
                <MoodleDisplay moodleData={moodleData} handleFetchMoodle={handleFetchMoodle} setMoodleData={setMoodleData} />
            ) : (
                <MoodleUserPassForm handleFetchMoodle={handleFetchMoodle} />
            )}
        </>
    );
}