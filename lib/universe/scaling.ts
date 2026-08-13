export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function logScale(value: number, inputMax: number, outputMin: number, outputMax: number): number {
  if (inputMax <= 0) return outputMin
  const safe = Math.max(0, value)
  const normalized = Math.log1p(safe) / Math.log1p(Math.max(1, inputMax))
  return outputMin + (outputMax - outputMin) * clamp(normalized, 0, 1)
}

export function sqrtScale(
  value: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
): number {
  if (inputMax <= 0) return outputMin
  const normalized = Math.sqrt(Math.max(0, value) / inputMax)
  return outputMin + (outputMax - outputMin) * clamp(normalized, 0, 1)
}

export function asteroidCountFromForks(forks: number): number {
  return Math.round(logScale(forks, 1_000_000, 20, 120))
}
