"use client"

import { PuffLoader } from "react-spinners";

type Props = {
    isFullScreen?: boolean;
}

const Loader = ({isFullScreen = true}: Props) => {
    return (
        <div
            style={{height: isFullScreen ? "70vh" : "30vh"}}
            className="h-[70vh] flex flex-col justify-center items-center"
        >
            <PuffLoader size={150}  color="#823D9A"/>
        </div>
    );
};

export default Loader;