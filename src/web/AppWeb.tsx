import React, { useMemo, useState } from 'react';
import { PLACE_SLOTS } from '../constants/defaults';
import { useAppContext } from '../context/AppContext';
import { searchDutchCities } from '../services/geocoding';
import { Place, UserProfile } from '../types';
import { calculateFlightEstimates } from '../utils/calculations';
import { formatDate, formatDistance, formatDuration, formatFuel } from '../utils/format';
import { RouteMap } from '../components/RouteMap';

type TabKey = 'dashboard' | 'flights' | 'checklist' | 'profile';

type FlightFormState = {
  id?: string;
  name: string;
  places: Array<Place | null>;
};

function createEmptyForm(): FlightFormState {
  return {
    name: '',
    places: [null, null, null, null, null],
  };
}

function fillFormFromFlight(
  flight?: {
    id: string;
    name: string;
    places: Place[];
  },
): FlightFormState {
  const form = createEmptyForm();

  if (!flight) {
    return form;
  }

  form.id = flight.id;
  form.name = flight.name;
  flight.places.forEach((place, index) => {
    if (index < form.places.length) {
      form.places[index] = place;
    }
  });

  return form;
}

function PlaceSearchField({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: Place | null;
  onSelect: (place: Place | null) => void;
}) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    setQuery(value?.name ?? '');
  }, [value?.name]);

  React.useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setMessage('');
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setMessage('');
        const nextResults = await searchDutchCities(trimmed);
        setResults(nextResults);
        if (nextResults.length === 0) {
          setMessage('Geen Nederlandse plaats gevonden.');
        }
      } catch {
        setResults([]);
        setMessage('Zoeken lukt nu even niet.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <label className="web-field">
      <span>{label}</span>
      <input
        value={query}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          if (!nextValue.trim()) {
            onSelect(null);
          }
        }}
        placeholder="Zoek een plaats in Nederland"
      />
      {loading ? <small>Plaatsen worden gezocht...</small> : null}
      {message ? <small className="web-error">{message}</small> : null}
      {results.length > 0 ? (
        <div className="web-search-results">
          {results.map((result) => (
            <button
              key={result.id}
              className="web-search-item"
              type="button"
              onClick={() => {
                onSelect(result);
                setQuery(result.name);
                setResults([]);
                setMessage('');
              }}
            >
              <strong>{result.name}</strong>
              <span>{result.province ?? 'Nederland'}</span>
            </button>
          ))}
        </div>
      ) : null}
      {value ? (
        <button
          className="web-chip"
          type="button"
          onClick={() => {
            onSelect(null);
            setQuery('');
            setResults([]);
          }}
        >
          Geselecteerd: {value.name}
        </button>
      ) : null}
    </label>
  );
}

function DashboardTab({
  onCreateFlight,
  onOpenChecklist,
  onOpenProfile,
}: {
  onCreateFlight: () => void;
  onOpenChecklist: () => void;
  onOpenProfile: () => void;
}) {
  const { profile, flights } = useAppContext();

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearlyFlights = flights.filter(
      (flight) => new Date(flight.createdAt).getFullYear() === currentYear,
    );
    const totalDistance = yearlyFlights.reduce((sum, flight) => sum + flight.totalDistanceKm, 0);
    const totalDuration = yearlyFlights.reduce((sum, flight) => sum + flight.estimatedDurationHours, 0);
    const totalFuel = yearlyFlights.reduce((sum, flight) => sum + flight.estimatedFuelLiters, 0);

    return {
      count: yearlyFlights.length,
      distance: totalDistance,
      duration: totalDuration,
      averageFuel: yearlyFlights.length ? totalFuel / yearlyFlights.length : 0,
      lastFlight: flights[0],
    };
  }, [flights]);

  return (
    <section className="web-stack">
      <header className="web-hero">
        <div className="web-hero-badge">Paramotor Maatje</div>
        <h1>Hallo {profile.name}</h1>
        <p>Klaar om je volgende vlucht te plannen?</p>
      </header>

      <div className="web-stats-grid">
        <article className="web-stat-card">
          <span>Vluchten dit jaar</span>
          <strong>{stats.count}</strong>
        </article>
        <article className="web-stat-card">
          <span>Totale afstand</span>
          <strong>{formatDistance(stats.distance)}</strong>
        </article>
        <article className="web-stat-card">
          <span>Totale duur</span>
          <strong>{formatDuration(stats.duration)}</strong>
        </article>
        <article className="web-stat-card">
          <span>Gemiddeld verbruik</span>
          <strong>{formatFuel(stats.averageFuel)}</strong>
        </article>
      </div>

      <article className="web-panel">
        <h2>Snel starten</h2>
        <div className="web-button-list">
          <button type="button" className="web-button web-button-primary" onClick={onCreateFlight}>
            Nieuwe vlucht
          </button>
          <button type="button" className="web-button" onClick={onOpenChecklist}>
            Checklist openen
          </button>
          <button type="button" className="web-button" onClick={onOpenProfile}>
            Profiel aanpassen
          </button>
        </div>
      </article>

      <article className="web-panel">
        <h2>Laatste vlucht</h2>
        {stats.lastFlight ? (
          <>
            <strong>{stats.lastFlight.name}</strong>
            <p>{stats.lastFlight.places.map((place) => place.name).join(' → ')}</p>
            <small>{formatDate(stats.lastFlight.createdAt)}</small>
          </>
        ) : (
          <p>Nog geen vlucht opgeslagen.</p>
        )}
      </article>
    </section>
  );
}

function FlightsTab({
  formState,
  setFormState,
  selectedFlightId,
  setSelectedFlightId,
}: {
  formState: FlightFormState | null;
  setFormState: React.Dispatch<React.SetStateAction<FlightFormState | null>>;
  selectedFlightId: string | null;
  setSelectedFlightId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { flights, profile, saveFlight, deleteFlight } = useAppContext();
  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId) ?? null;
  const activePlaces = (formState?.places.filter(Boolean) as Place[]) ?? [];
  const estimates = calculateFlightEstimates(activePlaces, profile);

  return (
    <section className="web-stack">
      <article className="web-panel">
        <div className="web-row web-row-between">
          <div>
            <h1>Mijn vluchten</h1>
            <p>Maak routes, bekijk details en pas ze snel aan.</p>
          </div>
          <button
            type="button"
            className="web-button web-button-primary"
            onClick={() => {
              setSelectedFlightId(null);
              setFormState(createEmptyForm());
            }}
          >
            Vlucht maken
          </button>
        </div>
      </article>

      {formState ? (
        <article className="web-panel">
          <div className="web-row web-row-between">
            <h2>{formState.id ? 'Vlucht bewerken' : 'Nieuwe vlucht'}</h2>
            <button type="button" className="web-link-button" onClick={() => setFormState(null)}>
              Sluiten
            </button>
          </div>

          <label className="web-field">
            <span>Naam van de vlucht</span>
            <input
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => (current ? { ...current, name: event.target.value } : current))
              }
              placeholder="Bijvoorbeeld avondvlucht Veluwe"
            />
          </label>

          {PLACE_SLOTS.map((slot, index) => (
            <PlaceSearchField
              key={slot}
              label={slot}
              value={formState.places[index]}
              onSelect={(place) =>
                setFormState((current) => {
                  if (!current) {
                    return current;
                  }

                  const nextPlaces = [...current.places];
                  nextPlaces[index] = place;
                  return { ...current, places: nextPlaces };
                })
              }
            />
          ))}

          <RouteMap places={activePlaces} height={280} />

          <div className="web-summary-grid">
            <article className="web-soft-card">
              <span>Afstand</span>
              <strong>{formatDistance(estimates.totalDistanceKm)}</strong>
            </article>
            <article className="web-soft-card">
              <span>Duur</span>
              <strong>{formatDuration(estimates.estimatedDurationHours)}</strong>
            </article>
            <article className="web-soft-card">
              <span>Brandstof</span>
              <strong>{formatFuel(estimates.estimatedFuelLiters)}</strong>
            </article>
          </div>

          <div className="web-button-list">
            <button
              type="button"
              className="web-button web-button-primary"
              onClick={async () => {
                const finalPlaces = formState.places.filter(Boolean) as Place[];
                if (!formState.name.trim() || finalPlaces.length < 2) {
                  window.alert('Geef een naam op en kies minimaal een startstad en eindstad.');
                  return;
                }

                const now = new Date().toISOString();
                await saveFlight({
                  id: formState.id ?? `flight-${Date.now()}`,
                  name: formState.name.trim(),
                  places: finalPlaces,
                  createdAt: selectedFlight?.createdAt ?? now,
                  updatedAt: now,
                });
                setFormState(null);
              }}
            >
              Opslaan
            </button>
          </div>
        </article>
      ) : null}

      {selectedFlight ? (
        <article className="web-panel">
          <div className="web-row web-row-between">
            <div>
              <h2>{selectedFlight.name}</h2>
              <p>{selectedFlight.places.map((place) => place.name).join(' → ')}</p>
            </div>
            <button type="button" className="web-link-button" onClick={() => setSelectedFlightId(null)}>
              Sluiten
            </button>
          </div>
          <RouteMap places={selectedFlight.places} height={280} />
          <div className="web-summary-grid">
            <article className="web-soft-card">
              <span>Afstand</span>
              <strong>{formatDistance(selectedFlight.totalDistanceKm)}</strong>
            </article>
            <article className="web-soft-card">
              <span>Duur</span>
              <strong>{formatDuration(selectedFlight.estimatedDurationHours)}</strong>
            </article>
            <article className="web-soft-card">
              <span>Brandstof</span>
              <strong>{formatFuel(selectedFlight.estimatedFuelLiters)}</strong>
            </article>
          </div>
          <div className="web-button-list">
            <button
              type="button"
              className="web-button"
              onClick={() => setFormState(fillFormFromFlight(selectedFlight))}
            >
              Bewerken
            </button>
            <button
              type="button"
              className="web-button web-button-danger"
              onClick={async () => {
                if (window.confirm('Weet je zeker dat je deze vlucht wilt verwijderen?')) {
                  await deleteFlight(selectedFlight.id);
                  setSelectedFlightId(null);
                }
              }}
            >
              Verwijderen
            </button>
          </div>
        </article>
      ) : null}

      <div className="web-stack">
        {flights.length === 0 ? (
          <article className="web-panel web-empty">
            <h2>Nog geen vluchten</h2>
            <p>Maak je eerste route en begin met het bijhouden van je vluchten.</p>
          </article>
        ) : (
          flights.map((flight) => (
            <article key={flight.id} className="web-panel web-flight-card">
              <div className="web-row web-row-between">
                <div>
                  <h3>{flight.name}</h3>
                  <p>{flight.places.map((place) => place.name).join(' → ')}</p>
                </div>
                <small>{formatDate(flight.createdAt)}</small>
              </div>
              <div className="web-inline-stats">
                <span>{formatDistance(flight.totalDistanceKm)}</span>
                <span>{formatDuration(flight.estimatedDurationHours)}</span>
                <span>{formatFuel(flight.estimatedFuelLiters)}</span>
              </div>
              <button
                type="button"
                className="web-button"
                onClick={() => {
                  setSelectedFlightId(flight.id);
                  setFormState(null);
                }}
              >
                Details bekijken
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ChecklistTab() {
  const { checklistItems, toggleChecklistItem, addChecklistItem, deleteChecklistItem, resetChecklist } =
    useAppContext();
  const [newItem, setNewItem] = useState('');
  const completed = checklistItems.filter((item) => item.completed).length;

  return (
    <section className="web-stack">
      <article className="web-panel">
        <h1>Checklist</h1>
        <p>
          {completed} van {checklistItems.length} afgerond
        </p>
        <button type="button" className="web-button" onClick={() => void resetChecklist()}>
          Reset voor nieuwe vlucht
        </button>
      </article>

      <article className="web-panel">
        <h2>Voor vertrek</h2>
        <div className="web-checklist">
          {checklistItems.map((item) => (
            <label key={item.id} className="web-check-item">
              <div className="web-check-main">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => void toggleChecklistItem(item.id)}
                />
                <span>{item.label}</span>
              </div>
              {!item.isDefault ? (
                <button type="button" className="web-link-button" onClick={() => void deleteChecklistItem(item.id)}>
                  Verwijder
                </button>
              ) : null}
            </label>
          ))}
        </div>
      </article>

      <article className="web-panel">
        <h2>Eigen item toevoegen</h2>
        <div className="web-row">
          <input
            className="web-input-inline"
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            placeholder="Bijvoorbeeld water mee"
          />
          <button
            type="button"
            className="web-button web-button-primary"
            onClick={async () => {
              await addChecklistItem(newItem);
              setNewItem('');
            }}
          >
            Toevoegen
          </button>
        </div>
      </article>
    </section>
  );
}

function ProfileTab() {
  const { profile, saveProfile } = useAppContext();
  const [form, setForm] = useState<UserProfile>(profile);

  React.useEffect(() => {
    setForm(profile);
  }, [profile]);

  return (
    <section className="web-stack">
      <article className="web-panel">
        <h1>Profiel</h1>
        <p>Pas je instellingen aan voor nieuwe routeberekeningen.</p>

        <label className="web-field">
          <span>Naam</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="web-field">
          <span>Minimale snelheid (km/u)</span>
          <input
            type="number"
            value={form.minSpeed}
            onChange={(event) => setForm({ ...form, minSpeed: Number(event.target.value) })}
          />
        </label>
        <label className="web-field">
          <span>Maximale snelheid (km/u)</span>
          <input
            type="number"
            value={form.maxSpeed}
            onChange={(event) => setForm({ ...form, maxSpeed: Number(event.target.value) })}
          />
        </label>
        <label className="web-field">
          <span>Gemiddeld verbruik per uur (L)</span>
          <input
            type="number"
            value={form.avgFuelConsumptionPerHour}
            onChange={(event) =>
              setForm({ ...form, avgFuelConsumptionPerHour: Number(event.target.value) })
            }
          />
        </label>
        <label className="web-field">
          <span>Naam van de setup</span>
          <input
            value={form.setupName ?? ''}
            onChange={(event) => setForm({ ...form, setupName: event.target.value })}
          />
        </label>
        <label className="web-field">
          <span>Noodcontact</span>
          <input
            value={form.emergencyContact ?? ''}
            onChange={(event) => setForm({ ...form, emergencyContact: event.target.value })}
          />
        </label>

        <button
          type="button"
          className="web-button web-button-primary"
          onClick={async () => {
            await saveProfile(form);
            window.alert('Profiel opgeslagen.');
          }}
        >
          Profiel opslaan
        </button>
      </article>
    </section>
  );
}

export function AppWeb() {
  const { isLoaded } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FlightFormState | null>(null);

  const canGoBack = activeTab !== 'dashboard' || selectedFlightId !== null || formState !== null;

  const handleBack = () => {
    if (formState) {
      setFormState(null);
      return;
    }

    if (selectedFlightId) {
      setSelectedFlightId(null);
      return;
    }

    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  if (!isLoaded) {
    return (
      <main className="web-shell">
        <section className="web-phone-frame">
          <div className="web-loading">Gegevens worden geladen...</div>
        </section>
      </main>
    );
  }

  return (
    <main className="web-shell">
      <section className="web-phone-frame">
        <div className="web-topbar">
          {canGoBack ? (
            <button type="button" className="web-back-button" onClick={handleBack} aria-label="Ga terug">
              ←
            </button>
          ) : (
            <div className="web-back-button-placeholder" />
          )}
          <div>
            <strong>Stef Stuntpiloot</strong>
            <span>Flight tracker voor mobiel web</span>
          </div>
          <div className="web-topbar-glow" />
        </div>

        <div className="web-content">
          {activeTab === 'dashboard' ? (
            <DashboardTab
              onCreateFlight={() => {
                setActiveTab('flights');
                setSelectedFlightId(null);
                setFormState(createEmptyForm());
              }}
              onOpenChecklist={() => setActiveTab('checklist')}
              onOpenProfile={() => setActiveTab('profile')}
            />
          ) : null}
          {activeTab === 'flights' ? (
            <FlightsTab
              formState={formState}
              setFormState={setFormState}
              selectedFlightId={selectedFlightId}
              setSelectedFlightId={setSelectedFlightId}
            />
          ) : null}
          {activeTab === 'checklist' ? <ChecklistTab /> : null}
          {activeTab === 'profile' ? <ProfileTab /> : null}
        </div>

        <nav className="web-bottom-nav">
          <button type="button" className={activeTab === 'dashboard' ? 'is-active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button type="button" className={activeTab === 'flights' ? 'is-active' : ''} onClick={() => setActiveTab('flights')}>
            Vluchten
          </button>
          <button type="button" className={activeTab === 'checklist' ? 'is-active' : ''} onClick={() => setActiveTab('checklist')}>
            Checklist
          </button>
          <button type="button" className={activeTab === 'profile' ? 'is-active' : ''} onClick={() => setActiveTab('profile')}>
            Profiel
          </button>
        </nav>
      </section>
    </main>
  );
}
