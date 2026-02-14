// lib/navLoadingToast.js
import toast from "react-hot-toast";

export function startNavLoadingToast(message = "Loading…") {
    const id = toast.loading(message);
    window.__LL_NAV_LOADING_TOAST_ID__ = id;
    return id;
}
