export const formatDistance = (distanceKm: number) => `${distanceKm.toFixed(1)} km`;

export const formatFuel = (fuelLiters: number) => `${fuelLiters.toFixed(1)} L`;

export const formatDuration = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const roundedHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (roundedHours <= 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${roundedHours} u`;
  }

  return `${roundedHours} u ${minutes} min`;
};

export const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));

export const formatDateTime = (isoDate: string) =>
  new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
