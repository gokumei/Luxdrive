import { useState, useEffect, useMemo } from "react";
import { Search, X, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import { apiUrl } from "@/lib/apiConfig";

const API_URL = apiUrl("/api/bookings");

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const STATUS_LABEL = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

const STATUS_STYLE = {
  pending:
    "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmed:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed:
    "bg-sky-500/15 text-sky-400 border-sky-500/30",
  cancelled:
    "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString();
}

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const res = await adminFetch(API_URL);

      if (!res.ok) {
        throw new Error("Buchungen konnten nicht geladen werden");
      }

      const items = await res.json();

      setBookings(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      toast.error("Buchungen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (
        statusFilter !== "all" &&
        b.status !== statusFilter
      ) {
        return false;
      }

      if (dateFilter) {
        const bookingDate = b.date
          ? new Date(b.date).toISOString().slice(0, 10)
          : "";

        if (bookingDate !== dateFilter) {
          return false;
        }
      }

      if (query.trim()) {
        const q = query.toLowerCase();

        const haystack = `
          ${b.first_name || ""}
          ${b.last_name || ""}
          ${b.email || ""}
          ${b.phone_number || ""}
          ${b.pickup_location || ""}
          ${b.destination || ""}
          ${b.vehicle || ""}
        `.toLowerCase();

        if (!haystack.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, query, statusFilter, dateFilter]);

  const updateStatus = async (id, status) => {
    try {
      const res = await adminFetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Status konnte nicht aktualisiert werden");
      }

      setBookings((current) =>
        current.map((b) =>
          b.id === id ? { ...b, status } : b
        )
      );

      setSelected((current) =>
        current?.id === id
          ? { ...current, status }
          : current
      );

      toast.success("Status erfolgreich aktualisiert");
    } catch (err) {
      console.error(err);
      toast.error("Status konnte nicht aktualisiert werden");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Möchten Sie diese Buchung dauerhaft löschen?")) {
      return;
    }

    try {
      const res = await adminFetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Buchung konnte nicht gelöscht werden");
      }

      setBookings((current) =>
        current.filter((b) => b.id !== id)
      );

      setSelected(null);

      toast.success("Buchung erfolgreich gelöscht");
    } catch (err) {
      console.error(err);
      toast.error("Buchung konnte nicht gelöscht werden");
    }
  };

  const saveEdit = async (id, data) => {
    try {
      const vehicleId = Number(data.vehicle_id);

      if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
        toast.error("Ein gültiges Fahrzeug ist erforderlich");
        return;
      }

      const res = await adminFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: `${data.first_name || ""} ${
            data.last_name || ""
          }`.trim(),

          customer_email: data.email,
          customer_phone: data.phone_number,

          pickup_location: data.pickup_location,
          dropoff_location: data.destination,

          pickup_date: data.date
            ? data.date.slice(0, 10)
            : "",

          pickup_time: data.time,

          passengers: Number(data.passengers) || 1,

          special_requests:
            data.special_requests || "",

          status: data.status,

          vehicle_id: vehicleId,
        }),
      });

      if (!res.ok) {
        throw new Error("Buchung konnte nicht aktualisiert werden");
      }

      setBookings((current) =>
        current.map((b) =>
          b.id === id ? { ...b, ...data } : b
        )
      );

      setSelected(null);

      toast.success("Buchung erfolgreich aktualisiert");
    } catch (err) {
      console.error(err);
      toast.error("Buchung konnte nicht aktualisiert werden");
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-lunar"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, E-Mail, Ort oder Fahrzeug suchen …"
            className="w-full bg-secondary border border-white/10 pl-10 pr-4 py-2.5 text-sm text-ivory outline-none focus:border-gold/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="bg-secondary border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:border-gold/50"
        >
          <option value="all">Alle Status</option>

          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
              className="capitalize"
            >
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>

        <div className="relative">
          <Calendar
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-lunar pointer-events-none"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
            className="bg-secondary border border-white/10 pl-10 pr-4 py-2.5 text-sm text-ivory outline-none focus:border-gold/50"
          />
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-secondary border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-lunar text-[10px] tracking-[0.2em] uppercase border-b border-white/10">
              <th className="px-4 py-3 font-medium">
                Kunde
              </th>

              <th className="px-4 py-3 font-medium hidden md:table-cell">
                Strecke
              </th>

              <th className="px-4 py-3 font-medium hidden lg:table-cell">
                Datum
              </th>

              <th className="px-4 py-3 font-medium">
                Fahrzeug
              </th>

              <th className="px-4 py-3 font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-lunar"
                >
                  Buchungen werden geladen …
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-lunar"
                >
                  Keine Buchungen gefunden.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() =>
                    setSelected(booking)
                  }
                  className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-ivory">
                      {booking.first_name}{" "}
                      {booking.last_name}
                    </div>

                    <div className="text-lunar text-xs">
                      {booking.phone_number}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-lunar hidden md:table-cell text-xs">
                    {booking.pickup_location}
                    {" → "}
                    {booking.destination}
                  </td>

                  <td className="px-4 py-3 text-lunar hidden lg:table-cell font-mono text-xs">
                    {formatDate(booking.date)}
                    {" · "}
                    {booking.time}
                  </td>

                  <td className="px-4 py-3 text-lunar text-xs">
                    {booking.vehicle || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] tracking-wide uppercase ${
                        STATUS_STYLE[booking.status] || ""
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />

                      {STATUS_LABEL[booking.status] || STATUS_LABEL.pending}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDetail
          booking={selected}
          onClose={() => setSelected(null)}
          onStatus={(status) =>
            updateStatus(selected.id, status)
          }
          onDelete={() =>
            remove(selected.id)
          }
          onSave={(data) =>
            saveEdit(selected.id, data)
          }
        />
      )}
    </div>
  );
}

function BookingDetail({
  booking,
  onClose,
  onStatus,
  onDelete,
  onSave,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ...booking,
    date: booking.date
      ? booking.date.slice(0, 10)
      : "",
  });

  const Row = ({ label, value }) => (
    <div className="py-3 border-b border-white/5 flex justify-between gap-4">
      <span className="text-lunar text-xs tracking-wide uppercase">
        {label}
      </span>

      <span className="text-ivory text-sm text-right">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-obsidian/80"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-secondary border-l border-white/10 h-full overflow-y-auto">
        <div className="sticky top-0 bg-secondary/95 backdrop-blur flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
          <h3 className="font-display text-2xl text-ivory">
            {editing
              ? "Buchung bearbeiten"
              : "Buchungsdetails"}
          </h3>

          <button
            onClick={onClose}
            className="text-lunar hover:text-ivory"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!editing ? (
            <>
              <Row
                label="Name"
                value={`${booking.first_name || ""} ${
                  booking.last_name || ""
                }`}
              />

              <Row
                label="Telefon"
                value={booking.phone_number}
              />

              <Row
                label="E-Mail"
                value={booking.email}
              />

              <Row
                label="Abholort"
                value={booking.pickup_location}
              />

              <Row
                label="Ziel"
                value={booking.destination}
              />

              <Row
                label="Datum"
                value={formatDate(booking.date)}
              />

              <Row
                label="Uhrzeit"
                value={booking.time}
              />

              <Row
                label="Fahrzeug"
                value={booking.vehicle}
              />

              <Row
                label="Fahrgäste"
                value={booking.passengers}
              />

              <Row
                label="Notizen"
                value={booking.special_requests}
              />

              <div className="mt-6">
                <p className="text-lunar text-xs tracking-[0.2em] uppercase mb-3">
                  Status ändern zu
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        onStatus(status)
                      }
                      className={`py-2 text-xs tracking-wide uppercase border transition-colors ${
                        booking.status === status
                          ? "border-gold text-gold bg-gold/5"
                          : "border-white/10 text-lunar hover:border-white/30"
                      }`}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 h-11 border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-obsidian transition-colors"
                >
                  Bearbeiten
                </button>

                <button
                  onClick={onDelete}
                  className="h-11 px-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          ) : (
            <EditForm
              form={form}
              setForm={setForm}
              onCancel={() => setEditing(false)}
              onSave={() => {
                onSave(form);
                setEditing(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EditForm({
  form,
  setForm,
  onCancel,
  onSave,
}) {
  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const cls =
    "w-full bg-obsidian border border-white/10 px-3 py-2 text-sm text-ivory outline-none focus:border-gold/50";

  const lbl =
    "block text-[10px] tracking-[0.2em] uppercase text-lunar mb-1.5";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Vorname</label>

          <input
            className={cls}
            value={form.first_name || ""}
            onChange={(e) =>
              set("first_name", e.target.value)
            }
          />
        </div>

        <div>
          <label className={lbl}>Nachname</label>

          <input
            className={cls}
            value={form.last_name || ""}
            onChange={(e) =>
              set("last_name", e.target.value)
            }
          />
        </div>
      </div>

      <div>
        <label className={lbl}>E-Mail</label>

        <input
          className={cls}
          value={form.email || ""}
          onChange={(e) =>
            set("email", e.target.value)
          }
        />
      </div>

      <div>
        <label className={lbl}>Telefon</label>

        <input
          className={cls}
          value={form.phone_number || ""}
          onChange={(e) =>
            set("phone_number", e.target.value)
          }
        />
      </div>

      <div>
        <label className={lbl}>Abholort</label>

        <input
          className={cls}
          value={form.pickup_location || ""}
          onChange={(e) =>
            set("pickup_location", e.target.value)
          }
        />
      </div>

      <div>
        <label className={lbl}>Ziel</label>

        <input
          className={cls}
          value={form.destination || ""}
          onChange={(e) =>
            set("destination", e.target.value)
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Datum</label>

          <input
            type="date"
            className={cls}
            value={form.date || ""}
            onChange={(e) =>
              set("date", e.target.value)
            }
          />
        </div>

        <div>
          <label className={lbl}>Uhrzeit</label>

          <input
            type="time"
            className={cls}
            value={form.time || ""}
            onChange={(e) =>
              set("time", e.target.value)
            }
          />
        </div>
      </div>

      <div>
        <label className={lbl}>Fahrzeug</label>

        <input
          className={cls}
          value={form.vehicle || ""}
          onChange={(e) =>
            set("vehicle", e.target.value)
          }
        />
      </div>

      <div>
        <label className={lbl}>Fahrgäste</label>

        <input
          type="number"
          min="1"
          className={cls}
          value={form.passengers || ""}
          onChange={(e) =>
            set(
              "passengers",
              Number(e.target.value)
            )
          }
        />
      </div>

      <div>
        <label className={lbl}>Notizen</label>

        <textarea
          rows={3}
          className={`${cls} resize-none`}
          value={form.special_requests || ""}
          onChange={(e) =>
            set(
              "special_requests",
              e.target.value
            )
          }
        />
      </div>

      <div>
        <label className={lbl}>Status</label>

        <select
          className={cls}
          value={form.status || "pending"}
          onChange={(e) =>
            set("status", e.target.value)
          }
        >
          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onSave}
          className="flex-1 h-11 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light"
        >
          Speichern
        </button>

        <button
          onClick={onCancel}
          className="flex-1 h-11 border border-white/10 text-lunar text-xs tracking-[0.2em] uppercase hover:text-ivory"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
