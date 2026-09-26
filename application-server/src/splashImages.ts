import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Static asset set simulating an application service (see docs/OVERVIEW.md,
// sequences 5-6). Lives outside src/ (like homepage-server's public/) since
// it's a data file, not something tsc should compile.
const assetsDir = path.join(__dirname, '..', 'assets', 'splash-images')

export interface SplashImage {
  id: string
  name: string
  filename: string
  contentType: string
}

export const splashImages: SplashImage[] = [
  { id: 'sun', name: 'Sun', filename: 'sun.svg', contentType: 'image/svg+xml' },
]

export function findSplashImage(id: string): SplashImage | undefined {
  return splashImages.find((image) => image.id === id)
}

export function splashImagePath(image: SplashImage): string {
  return path.join(assetsDir, image.filename)
}
