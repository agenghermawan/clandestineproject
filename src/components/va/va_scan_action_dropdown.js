import {useState, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import {MdMoreVert, MdReplay, MdDelete, MdStop} from "react-icons/md";

function ScanActionsDropdown({scan, onRescan, onStop, onDelete}) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({left: 0, top: 0});
    const btnRef = useRef();

    useEffect(() => {
        function handleClickOutside(e) {
            if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
        }

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    function handleOpen(e) {
        e.stopPropagation();
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({left: rect.left, top: rect.bottom});
        setOpen((o) => !o);
    }

    const canStop = ["running", "starting", "queued"].includes(scan.status);

    return (
        <>
            <button
                ref={btnRef}
                className="p-2 rounded-full hover:bg-[#232339] transition"
                onClick={handleOpen}
                title="More actions"
            >
                <MdMoreVert size={20}/>
            </button>
            {open &&
                createPortal(
                    <div
                        className="z-[9999] fixed w-40 rounded-xl border border-[#232339] bg-[#181825] shadow-xl py-2"
                        style={{
                            top: coords.top + 4,
                            left: coords.left - 160 + 32,
                        }}
                    >
                        <button
                            className="flex items-center w-full gap-2 px-4 py-2 text-sm hover:bg-[#232339] text-white"
                            onClick={e => {
                                e.stopPropagation();
                                setOpen(false);
                                onRescan(scan);
                            }}>
                            <MdReplay className="text-blue-400"/> Rescan
                        </button>
                        <button
                            className={`flex items-center w-full gap-2 px-4 py-2 text-sm ${canStop ? "hover:bg-[#232339] text-yellow-400" : "text-gray-500 cursor-not-allowed"}`}
                            onClick={e => {
                                e.stopPropagation();
                                if (canStop) {
                                    setOpen(false);
                                    onStop(scan.scan_id);
                                }
                            }}
                            disabled={!canStop}
                        >
                            <MdStop/> Stop
                        </button>
                        <button
                            className="flex items-center w-full gap-2 px-4 py-2 text-sm hover:bg-[#232339] text-red-400"
                            onClick={e => {
                                e.stopPropagation();
                                setOpen(false);
                                onDelete(scan.scan_id);
                            }}>
                            <MdDelete/> Delete
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default ScanActionsDropdown;