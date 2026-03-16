
import { useEffect, useState } from "react";
import NoContentFound from "../NoContentFound";
import MarksDisplay from "./marksDislay";
import MoodleDisplay, { MoodleUserPassForm } from "./moodleDisplay";

export default function MarksSubTab({ data, moodleData, handleFetchMoodle, setMoodleData, IDs }) {
    return (
        <>
            <MarksDisplay data={data} />
            {(IDs.MoodleUsername && IDs.MoodlePassword) ? (
                <MoodleDisplay moodleData={moodleData} handleFetchMoodle={handleFetchMoodle} setMoodleData={setMoodleData} IDs={IDs} />
            ) : (
                <MoodleUserPassForm handleFetchMoodle={handleFetchMoodle} IDs={IDs} />
            )}
        </>
    );
}