import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/adminFetch';
import { apiUrl } from '@/lib/apiConfig';

export default function ContentManager() {
  const [content, setContent] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      // Testimonials now come from our Express backend.
      const testimonialResponse = await adminFetch(
        apiUrl("/api/testimonials/admin")
      );

      if (!testimonialResponse.ok) {
        throw new Error("Kundenbewertungen konnten nicht geladen werden");
      }

      const testimonialItems = await testimonialResponse.json();

      setTestimonials(
        (testimonialItems || []).map((testimonial) => ({
          ...testimonial,
          name: testimonial.customer_name,
          role: testimonial.customer_title,
          quote: testimonial.review,
          approved:
            testimonial.approved === true || testimonial.approved === 1,
        }))
      );

      try {
        const contentResponse = await fetch(
          apiUrl("/api/site-settings")
        );

        if (!contentResponse.ok) {
          throw new Error("Website-Inhalte konnten nicht geladen werden");
        }

        const contentItem = await contentResponse.json();

        setContent(contentItem || {});
      } catch (err) {
        console.error("Site content load error:", err);
        setContent(null);
      }
    } catch (err) {
      console.error("Content load error:", err);
      toast.error("Bewertungen konnten nicht geladen werden");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveContent = async (data) => {
    try {
      const payload = {
        hero_headline: data.hero_headline || "",
        hero_subheadline: data.hero_subheadline || "",
        about_title: data.about_title || "",
        about_body: data.about_body || "",
        company_phone: data.company_phone || "",
        company_email: data.company_email || "",
        whatsapp_number: data.whatsapp_number || "",
        business_hours: data.business_hours || "",
      };

      const response = await adminFetch(
        apiUrl("/api/site-settings"),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Website-Inhalte konnten nicht gespeichert werden");
      }

      const updatedContent = await response.json();

      setContent(updatedContent);
      toast.success("Inhalte erfolgreich gespeichert");
    } catch (err) {
      console.error(err);
      toast.error("Inhalte konnten nicht gespeichert werden");
    }
  };

  const saveTestimonial = async (data) => {
    try {
      const payload = {
        name: data.name,
        role: data.role,
        quote: data.quote,
        rating: Number(data.rating) || 5,
      };

      let response;

      if (data.id) {
        response = await adminFetch(
          apiUrl(`/api/testimonials/${data.id}`),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await adminFetch(
          apiUrl("/api/testimonials"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Kundenbewertung konnte nicht gespeichert werden");
      }

      setEditing(null);
      await load();

      toast.success("Kundenbewertung erfolgreich gespeichert");
    } catch (err) {
      console.error(err);
      toast.error("Kundenbewertung konnte nicht gespeichert werden");
    }
  };

  const removeTestimonial = async (id) => {
    if (!confirm("Möchten Sie diese Kundenbewertung löschen?")) return;

    try {
      const response = await adminFetch(
        apiUrl(`/api/testimonials/${id}`),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Kundenbewertung konnte nicht gelöscht werden");
      }

      await load();
      toast.success("Kundenbewertung erfolgreich gelöscht");
    } catch (err) {
      console.error(err);
      toast.error("Kundenbewertung konnte nicht gelöscht werden");
    }
  };

  const setApproval = async (testimonial) => {
    const approved = !testimonial.approved;

    try {
      const response = await adminFetch(
        apiUrl(`/api/testimonials/${testimonial.id}/approval`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        throw new Error("Status konnte nicht geändert werden");
      }

      setTestimonials((current) =>
        current.map((item) =>
          item.id === testimonial.id ? { ...item, approved } : item
        )
      );
      toast.success(
        approved ? "Bewertung veröffentlicht." : "Bewertung ausgeblendet."
      );
    } catch (err) {
      console.error(err);
      toast.error("Status konnte nicht geändert werden.");
    }
  };

  const cls =
    "w-full bg-obsidian border border-white/10 px-3 py-2 text-sm text-ivory outline-none focus:border-gold/50";

  const lbl =
    "block text-[10px] tracking-[0.2em] uppercase text-lunar mb-1.5";

  return (
    <div className="space-y-10">
      <div className="bg-secondary border border-white/10 p-6 md:p-8">
        <h3 className="font-display text-2xl text-ivory mb-6">
          Website-Inhalte
        </h3>

        {content ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Hero-Überschrift</label>
                <input
                  className={cls}
                  value={content.hero_headline || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero_headline: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className={lbl}>Hero-Unterzeile</label>
                <input
                  className={cls}
                  value={content.hero_subheadline || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero_subheadline: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Über-uns-Titel</label>
              <input
                className={cls}
                value={content.about_title || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about_title: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className={lbl}>Über-uns-Text</label>
              <textarea
                rows={4}
                className={cls + " resize-none"}
                value={content.about_body || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about_body: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Telefon</label>
                <input
                  className={cls}
                  value={content.company_phone || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company_phone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className={lbl}>E-Mail</label>
                <input
                  className={cls}
                  value={content.company_email || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company_email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>WhatsApp-Nummer</label>
                <input
                  className={cls}
                  value={content.whatsapp_number || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      whatsapp_number: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className={lbl}>Öffnungszeiten</label>
                <input
                  className={cls}
                  value={content.business_hours || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      business_hours: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              onClick={() => saveContent(content)}
              className="h-11 px-8 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light"
            >
              Inhalte speichern
            </button>
          </div>
        ) : (
          <p className="text-lunar">Wird geladen …</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl text-ivory">
            Kundenbewertungen
          </h3>

          <button
            onClick={() =>
              setEditing({
                name: "",
                role: "",
                quote: "",
                rating: 5,
              })
            }
            className="inline-flex items-center gap-2 h-10 px-4 border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-obsidian"
          >
            <Plus size={14} />
            Hinzufügen
          </button>
        </div>

        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-secondary border border-white/10 p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-ivory text-sm">
                  <span>{t.name}</span>
                  <span
                    className={`px-2 py-0.5 border text-[10px] tracking-wide uppercase ${
                      t.approved
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {t.approved ? "Veröffentlicht" : "Ausstehend"}
                  </span>
                </div>

                {t.role && (
                  <div className="text-lunar text-xs mt-1">{t.role}</div>
                )}

                <div className="text-gold text-xs mt-2">
                  Sterne: {t.rating} von 5
                </div>

                <p className="text-lunar text-xs mt-1">
                  "{t.quote}"
                </p>

                {t.created_at && (
                  <div className="text-lunar/70 text-[10px] mt-2">
                    Datum: {new Date(t.created_at).toLocaleDateString("de-DE")}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => setApproval(t)}
                  className="h-8 px-3 border border-gold/40 text-gold text-[10px] tracking-wide uppercase hover:bg-gold hover:text-obsidian"
                >
                  {t.approved ? "Ausblenden" : "Veröffentlichen"}
                </button>

                <button
                  onClick={() => setEditing(t)}
                  aria-label="Bewertung bearbeiten"
                  className="h-8 w-8 border border-white/10 flex items-center justify-center text-lunar hover:text-gold"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => removeTestimonial(t.id)}
                  aria-label="Bewertung löschen"
                  className="h-8 w-8 border border-white/10 flex items-center justify-center text-lunar hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-obsidian/80"
            onClick={() => setEditing(null)}
          />

          <div className="relative w-full max-w-md bg-secondary border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-display text-xl text-ivory">
                {editing.id ? "Bewertung bearbeiten" : "Neue Bewertung"}
              </h4>

              <button
                onClick={() => setEditing(null)}
                className="text-lunar hover:text-ivory"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={lbl}>Name</label>
                <input
                  className={cls}
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className={lbl}>Position / Unternehmen</label>
                <input
                  className={cls}
                  value={editing.role || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      role: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className={lbl}>Bewertungstext</label>
                <textarea
                  rows={3}
                  className={cls + " resize-none"}
                  value={editing.quote}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      quote: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className={lbl}>Bewertung (1–5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className={cls}
                  value={editing.rating}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      rating: Number(e.target.value),
                    })
                  }
                />
              </div>

              <button
                onClick={() => saveTestimonial(editing)}
                className="w-full h-11 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
