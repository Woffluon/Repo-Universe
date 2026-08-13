import { asteroidCountFromForks, clamp, logScale, sqrtScale } from './scaling'
import { createSeededRandom, deriveSeed, hashString } from './seed'
import type { RepositoryUniverseData, UniverseModel } from './types'

export const UNIVERSE_CONFIG = {
  maxLanguages: 8,
  maxContributors: 18,
  asteroidRange: { min: 20, max: 120 },
} as const

const FALLBACK_COLORS = ['#4cc9f0', '#f72585', '#f9c74f', '#90be6d', '#b8c0ff', '#ff9f1c']

function deterministicColor(name: string): string {
  return FALLBACK_COLORS[hashString(name) % FALLBACK_COLORS.length]
}

export function createUniverseModel(data: RepositoryUniverseData): UniverseModel {
  const identity = data.repository.fullName.toLowerCase()
  const seed = hashString(identity)
  const rng = createSeededRandom(seed)
  const languages = data.languages.slice(0, UNIVERSE_CONFIG.maxLanguages)
  const maxBytes = Math.max(1, ...languages.map((language) => language.bytes))

  const starRadius = logScale(data.repository.stars + (data.repository.size ?? 0) / 40, 5_000_000, 1.9, 3.15)
  const starBrightness = logScale(data.repository.stars, 5_000_000, 0.72, 1.7)
  const primaryColor = languages[0]?.color || deterministicColor(identity)

  let orbitCursor = starRadius + 3.8
  const planets = languages.map((language, index) => {
    const radius = sqrtScale(language.bytes, maxBytes, 0.48, 1.28)
    orbitCursor += 2.25 + radius + (index === 0 ? 0.6 : 0)
    const orbitRadius = orbitCursor
    orbitCursor += radius * 0.45

    return {
      id: `language:${language.name}`,
      language: language.name,
      color: language.color || deterministicColor(language.name),
      percentage: language.percentage,
      bytes: language.bytes,
      radius,
      orbitRadius,
      orbitInclination: (rng() - 0.5) * 0.34,
      orbitLongitude: rng() * Math.PI * 2,
      startAngle: rng() * Math.PI * 2,
      orbitSpeed: 0.035 + rng() * 0.045,
      axialTilt: (rng() - 0.5) * 0.7,
      surfaceSeed: deriveSeed(seed, `surface:${language.name}`),
    }
  })

  const outerPlanetRadius = planets.at(-1)?.orbitRadius ?? starRadius + 7
  const beltInnerRadius = outerPlanetRadius + 3.2
  const beltOuterRadius = beltInnerRadius + 3.5
  const contributorBaseRadius = beltOuterRadius + 2.8
  const maxContributions = Math.max(1, ...data.contributors.map((entry) => entry.contributions))
  const contributorRng = createSeededRandom(deriveSeed(seed, 'contributors'))

  const contributors = data.contributors.slice(0, UNIVERSE_CONFIG.maxContributors).map((entry) => {
    const theta = contributorRng() * Math.PI * 2
    const phi = Math.acos(2 * contributorRng() - 1)
    const distance = contributorBaseRadius + contributorRng() * 3.2
    return {
      id: `contributor:${entry.username}`,
      username: entry.username,
      contributions: entry.contributions,
      intensity: logScale(entry.contributions, maxContributions, 0.65, 1.5),
      radius: logScale(entry.contributions, maxContributions, 0.16, 0.32),
      position: [
        Math.sin(phi) * Math.cos(theta) * distance,
        Math.cos(phi) * distance * 0.68,
        Math.sin(phi) * Math.sin(theta) * distance,
      ] as [number, number, number],
    }
  })

  return {
    seed,
    star: {
      id: 'repository',
      label: data.repository.fullName,
      radius: starRadius,
      brightness: starBrightness,
      activity: clamp(data.activity.score, 0, 1),
      color: primaryColor,
    },
    planets,
    contributors,
    asteroidBelt: {
      count: asteroidCountFromForks(data.repository.forks),
      innerRadius: beltInnerRadius,
      outerRadius: beltOuterRadius,
      seed: deriveSeed(seed, 'asteroids'),
    },
    background: { seed: deriveSeed(seed, 'background') },
    boundsRadius: contributorBaseRadius + 5.2,
  }
}
