export const DEFAULT_CHECKIN_RADIUS_M = 150

const EARTH_RADIUS_M = 6_371_000

export function distanceInMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2

  return Math.round(EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}
