import { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import { apiUrl } from "@/lib/apiConfig";
import ConfirmModal from "@/components/admin/ConfirmModal";

const API_URL = apiUrl("/api/contact-messages");

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminFetch(API_URL);
      if (!response.ok) throw new Error("Nachrichten konnten nicht geladen werden");
      setMessages(await response.json());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const remove = async (id) => {
    setDeleting(true);
    try {
      const response = await adminFetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Nachricht konnte nicht gelöscht werden");
      setMessages((current) => current.filter((message) => message.id !== id));
      toast.success("Nachricht gelöscht");
    } catch (removeError) {
      toast.error(removeError.message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  if (loading) return <div className="text-lunar">Nachrichten werden geladen …</div>;
  if (error) return <div className="text-red-300">{error}</div>;
  if (messages.length === 0) return <div className="text-lunar">Keine Nachrichten vorhanden.</div>;

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <article key={message.id} className="bg-secondary border border-white/10 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 text-ivory">
                <Mail size={16} className="shrink-0 text-gold" />
                <h2 className="font-display text-xl truncate">{message.name}</h2>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-lunar">
                <a className="hover:text-gold" href={`mailto:${message.email}`}>{message.email}</a>
                {message.phone && <a className="hover:text-gold" href={`tel:${message.phone}`}>{message.phone}</a>}
                <time dateTime={message.created_at}>
                  {message.created_at ? new Date(message.created_at).toLocaleString("de-DE") : ""}
                </time>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPendingDelete(message)}
              className="h-9 w-9 shrink-0 border border-white/10 text-lunar hover:border-red-400/50 hover:text-red-300"
              aria-label="Nachricht löschen"
            >
              <Trash2 size={15} className="mx-auto" />
            </button>
          </div>
          {message.subject && <div className="mt-5 text-sm font-medium text-ivory">{message.subject}</div>}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-lunar">{message.message}</p>
        </article>
      ))}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Nachricht löschen?"
        message="Möchten Sie diese Nachricht wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        loading={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete.id)}
      />
    </div>
  );
}
