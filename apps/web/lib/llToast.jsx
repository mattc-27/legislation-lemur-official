import toast from "react-hot-toast";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

function BaseToast({ t, intent = "info", title, message, actionLabel, onAction }) {
    const icon =
        intent === "success" ? <CheckCircle2 size={20} /> :
            intent === "error" ? <AlertTriangle size={20} /> :
                <Info size={20} />;

    return (
        <div className={`ll3-toast ll3-toast--${intent}`}>
            <span className="ll3-toast__icon" aria-hidden="true">{icon}</span>

            <div className="ll3-toast__body">
                {title && <div className="ll3-toast__title">{title}</div>}
                {message && <div className="ll3-toast__msg">{message}</div>}
            </div>

            <div className="ll3-toast__actions">
                {actionLabel && (
                    <button
                        className="ll3-toast__btn"
                        onClick={() => {
                            try { onAction?.(); } finally { toast.dismiss(t.id); }
                        }}
                    >
                        {actionLabel}
                    </button>
                )}

                <button
                    className="ll3-toast__btn"
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Dismiss"
                    title="Dismiss"
                    style={{ padding: "0 8px" }}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export const llToast = {
    success(title, message) {
        return toast.custom((t) => (
            <BaseToast t={t} intent="success" title={title} message={message} />
        ), { duration: 2200 });
    },

    info(title, message) {
        return toast.custom((t) => (
            <BaseToast t={t} intent="info" title={title} message={message} />
        ), { duration: 2800 });
    },

    error(title, message) {
        return toast.custom((t) => (
            <BaseToast t={t} intent="error" title={title} message={message} />
        ), { duration: 4500 });
    },

    undo(title, message, onUndo) {
        return toast.custom((t) => (
            <BaseToast
                t={t}
                intent="info"
                title={title}
                message={message}
                actionLabel="Undo"
                onAction={onUndo}
            />
        ), { duration: 6000 });
    },
};
