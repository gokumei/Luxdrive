import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/adminFetch';

const EMPTY = {
  name: '',
  brand: '',
  image_url: '',
  passenger_capacity: 3,
  luggage_capacity: 3,
  description: '',
  starting_price: 100,
  features: [],
  category: '',
  available: true,
};

export default function FleetManager() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/vehicles');

      if (!response.ok) {
        throw new Error('Fahrzeuge konnten nicht geladen werden');
      }

      const items = await response.json();
      setVehicles(items || []);
    } catch (err) {
      console.error(err);
      toast.error('Flotte konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (data) => {
    try {
      const payload = {
        name: data.name,
        brand: data.brand,
        category: data.category,
        description: data.description,
        image_url: data.image_url,
        passenger_capacity: Number(data.passenger_capacity) || 0,
        luggage_capacity: Number(data.luggage_capacity) || 0,
        starting_price: Number(data.starting_price) || 0,
        available: Boolean(data.available),
      };

      const url = data.id
        ? `http://localhost:5000/api/vehicles/${data.id}`
        : 'http://localhost:5000/api/vehicles';

      const response = await adminFetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Fahrzeug konnte nicht gespeichert werden');
      }

      setEditing(null);
      await load();

      toast.success(data.id ? 'Fahrzeug erfolgreich aktualisiert' : 'Fahrzeug erfolgreich erstellt');
    } catch (err) {
      console.error(err);
      toast.error('Fahrzeug konnte nicht gespeichert werden');
    }
  };

  const remove = async (id) => {
    if (!confirm('Möchten Sie dieses Fahrzeug löschen?')) return;

    try {
      const response = await adminFetch(
        `http://localhost:5000/api/vehicles/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Fahrzeug konnte nicht gelöscht werden');
      }

      await load();
      toast.success('Fahrzeug erfolgreich gelöscht');
    } catch (err) {
      console.error(err);
      toast.error('Fahrzeug konnte nicht gelöscht werden');
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 h-11 px-6 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light"
        >
          <Plus size={16} />
          Fahrzeug hinzufügen
        </button>
      </div>

      {loading ? (
        <p className="text-lunar text-center py-10">
          Wird geladen …
        </p>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10 text-lunar">
          Keine Fahrzeuge gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-secondary border border-white/10 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-obsidian relative">
                {v.image_url ? (
                  <Image
                    src={v.image_url}
                    alt={v.name}
                    fittingType="fill"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-lunar text-sm">
                    Kein Bild
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setEditing({
                      ...v,
                      features: v.features || [],
                    })}
                    className="h-8 w-8 bg-obsidian/80 border border-white/10 flex items-center justify-center text-lunar hover:text-gold"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => remove(v.id)}
                    className="h-8 w-8 bg-obsidian/80 border border-white/10 flex items-center justify-center text-lunar hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {!v.available && (
                  <div className="absolute bottom-3 left-3 bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-400">
                    Nicht verfügbar
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="font-display text-xl text-ivory">
                  {v.name}
                </div>

                <div className="text-lunar text-xs mt-1">
                  {v.passenger_capacity} Fahrgäste ·{' '}
                  {v.luggage_capacity} Gepäckstücke · $
                  {v.starting_price}
                </div>

                {v.category && (
                  <div className="text-lunar text-xs mt-2">
                    {v.category}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <VehicleForm
          vehicle={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function VehicleForm({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...vehicle,
    features: vehicle.features || [],
  });

  const [featureInput, setFeatureInput] = useState('');

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addFeature = () => {
    const feature = featureInput.trim();

    if (!feature) return;

    set(
      'features',
      [...(form.features || []), feature]
    );

    setFeatureInput('');
  };

  const removeFeature = (index) => {
    set(
      'features',
      form.features.filter((_, i) => i !== index)
    );
  };

  const cls =
    'w-full bg-obsidian border border-white/10 px-3 py-2 text-sm text-ivory outline-none focus:border-gold/50';

  const lbl =
    'block text-[10px] tracking-[0.2em] uppercase text-lunar mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-obsidian/80"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-secondary border-l border-white/10 h-full overflow-y-auto">
        <div className="sticky top-0 bg-secondary/95 backdrop-blur flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
          <h3 className="font-display text-2xl text-ivory">
            {vehicle.id ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}
          </h3>

          <button
            onClick={onClose}
            className="text-lunar hover:text-ivory"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <label className={lbl}>Name</label>
            <input
              className={cls}
              value={form.name || ''}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Mercedes-Maybach S580"
            />
          </div>

          <div>
            <label className={lbl}>Marke</label>
            <input
              className={cls}
              value={form.brand || ''}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="Mercedes-Benz"
            />
          </div>

          <div>
            <label className={lbl}>Kategorie</label>
            <input
              className={cls}
              value={form.category || ''}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Luxuslimousine"
            />
          </div>

          <div>
            <label className={lbl}>Bild-URL</label>
            <input
              className={cls}
              value={form.image_url || ''}
              onChange={(e) =>
                set('image_url', e.target.value)
              }
              placeholder="https://..."
            />

            {form.image_url && (
              <div className="mt-3 aspect-video bg-obsidian">
                <Image
                  src={form.image_url}
                  alt="Vorschau"
                  fittingType="fill"
                  className="h-full w-full"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Fahrgäste</label>
              <input
                type="number"
                className={cls}
                value={form.passenger_capacity ?? ''}
                onChange={(e) =>
                  set(
                    'passenger_capacity',
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className={lbl}>Gepäck</label>
              <input
                type="number"
                className={cls}
                value={form.luggage_capacity ?? ''}
                onChange={(e) =>
                  set(
                    'luggage_capacity',
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className={lbl}>Preis ab</label>
              <input
                type="number"
                className={cls}
                value={form.starting_price ?? ''}
                onChange={(e) =>
                  set(
                    'starting_price',
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Beschreibung</label>

            <textarea
              rows={3}
              className={cls + ' resize-none'}
              value={form.description || ''}
              onChange={(e) =>
                set('description', e.target.value)
              }
            />
          </div>

          <div>
            <label className={lbl}>Ausstattung</label>

            <div className="flex gap-2 mb-2">
              <input
                className={cls}
                value={featureInput}
                onChange={(e) =>
                  setFeatureInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Ausstattung hinzufügen …"
              />

              <button
                onClick={addFeature}
                className="px-3 border border-white/10 text-lunar hover:text-gold"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(form.features || []).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 bg-obsidian border border-white/10 px-2.5 py-1 text-xs text-ivory"
                >
                  {feature}

                  <button
                    onClick={() => removeFeature(index)}
                    className="text-lunar hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={Boolean(form.available)}
              onChange={(e) =>
                set('available', e.target.checked)
              }
              className="accent-[#D4AF37]"
            />

            <span className="text-sm text-ivory">
              Für Buchungen verfügbar
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onSave(form)}
              className="flex-1 h-11 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light"
            >
              Fahrzeug speichern
            </button>

            <button
              onClick={onClose}
              className="flex-1 h-11 border border-white/10 text-lunar text-xs tracking-[0.2em] uppercase hover:text-ivory"
            >
              Abbrechen
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
