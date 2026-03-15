import { useEffect, useState } from "react";
import { FourSquare } from "react-loading-indicators";
import api from "../services/api";

export default function Loading() 
{
    const [serverReady, setServerReady] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {            
            try {
                const res = await api.get("/api/health");
                if(res.status === 200) {
                    setServerReady(true);
                }
            } catch (error) {
                console.log("Server is still loading");
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, []);

    if(serverReady) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 z-0 flex flex-col gap-4">
            <FourSquare color="#818cf8" size="medium" />
            <p className="text-white text-3xl font-semibold animate-pulse">
                Waking up the server...
            </p>
            
            <p className="text-xl text-indigo-400 mt-2">
                This might take a few minutes.
            </p>
        </div>
    )
}