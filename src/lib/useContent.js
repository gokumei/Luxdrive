import { useState, useEffect } from 'react';
import { apiUrl, assetUrl } from '@/lib/apiConfig';

/**
 * @typedef {{
 *   id?: number,
 *   company_name?: string | null,
 *   address?: string | null,
 *   hero_headline?: string | null,
 *   hero_subheadline?: string | null,
 *   about_title?: string | null,
 *   about_body?: string | null,
 *   company_phone?: string | null,
 *   company_email?: string | null,
 *   whatsapp_number?: string | null,
 *   business_hours?: string | null
 * }} SiteContent
 *
 * @typedef {{ content: SiteContent | null }} SiteOutletContext
 */

/**
 * @returns {SiteContent | null}
 */
export function useSiteContent() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let active = true;

    fetch(apiUrl("/api/site-settings"))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load site content");
        }
        return res.json();
      })
      .then((settings) => {
        if (active) {
          setContent(settings || null);
        }
      })
      .catch((err) => {
        console.error("Site content fetch error:", err);
        if (active) {
          setContent(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return content;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(apiUrl("/api/vehicles"))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load vehicles");
        }
        return res.json();
      })
      .then((items) => {
        if (active) {
          const normalizedVehicles = (
            Array.isArray(items) ? items : []
          ).map((vehicle) => ({
            ...vehicle,
            available:
              vehicle.available === true ||
              vehicle.available === 1 ||
              vehicle.available === "1",
            starting_price: Number(vehicle.starting_price),
            passenger_capacity: Number(vehicle.passenger_capacity),
            luggage_capacity: Number(vehicle.luggage_capacity),
            features: Array.isArray(vehicle.features)
              ? vehicle.features
              : [],
            image_url: assetUrl(vehicle.image_url),
          }));

          setVehicles(normalizedVehicles);
        }
      })
      .catch((err) => {
        console.error("Vehicles fetch error:", err);
        if (active) {
          setVehicles([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    loading,
    vehicles,
  };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let active = true;

    fetch(apiUrl("/api/testimonials"))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load testimonials");
        }
        return res.json();
      })
      .then((items) => {
        if (active) {
          setTestimonials(items || []);
        }
      })
      .catch((err) => {
        console.error("Testimonials fetch error:", err);
        if (active) {
          setTestimonials([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return testimonials;
}
