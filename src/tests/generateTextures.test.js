/**
* @description Generate colorful and natural textures for use in 3D models.
* @module generateTextures.test
* @version 0.0.1
* @requires perlin-noise
* @requires files
* @see
* @todo
**/

import { beforeAll, describe, it } from 'mocha'

import { createCanvas } from 'canvas'
import { deleteFilesInDirectory } from '../utils/files'
import perlin from 'perlin-noise'
import { writeFileSync } from 'fs'

describe('Generate textures', () => {
  // Test suite for generating colorful textures
  describe('Colorful textures', () => {
    /**
     * Test case for generating colorful textures.
     */
    it('should create 6 files with colorful textures', async () => {
      // Your test code here
    })
  })

  // Test suite for generating natural textures
  describe('Natural textures', () => {
    /**
     * Test case for generating natural textures.
     */
    it('should create 6 files with natural textures', async () => {
      // Your test code here
    })
  })
})

/**
 * Delete all files in the "assets/textures" directory before running the tests.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
beforeAll(() => {
  if (typeof deleteFilesInDirectory === 'function') {
    deleteFilesInDirectory('assets/textures')
  }
})

/**
 * Generates a random color in hexadecimal format.
 * @returns {string} The randomly generated color in hexadecimal format.
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Generates a colorful texture with random colors and saves it as a PNG file.
 * @param {number} width - The width of the texture in pixels.
 * @param {number} height - The height of the texture in pixels.
 * @param {number} tileSize - The size of each tile in the texture in pixels.
 * @param {string} filename - The name of the file to save the texture as.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateColorfulTexture(width, height, tileSize, filename) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Draw the pattern on the canvas with random colors
  for (let x = 0; x < width; x += tileSize) {
    for (let y = 0; y < height; y += tileSize) {
      ctx.fillStyle = getRandomColor()
      ctx.fillRect(x, y, tileSize, tileSize)
    }
  }

  // Save the canvas as a PNG file
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(filename, buffer)
}

/**
 * Generates a natural texture based on Perlin noise and saves it as a PNG file.
 * @param {number} width - The width of the texture in pixels.
 * @param {number} height - The height of the texture in pixels.
 * @param {string} filename - The name of the file to save the texture as.
 */
function generateNaturalTexture(width, height, filename) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const noise = perlin.generatePerlinNoise(width, height, {
    octaveCount: 6,
    amplitude: 0.1,
    persistence: 0.2,
  })

  // Draw the pattern on the canvas based on the Perlin noise
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = noise && noise[x * height + y] || 0
      const color = Math.floor((value + 1) * 128)
      ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
      ctx.fillRect(x, y, 1, 1)
    }
  }

  // Save the canvas as a PNG file
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(filename, buffer)
}

/**
 * Test case for generating natural textures.
 */
it('should create 6 files with natural textures', async () => {
  // Set the dimensions of your texture and the Perlin noise scale
  const textureWidth = 500
  const textureHeight = 500
  const scale = 0.02

  // Generate 6 different natural textures with patterns
  for (let i = 1; i <= 6; i++) {
    const filename = `assets/textures/natural_texture_${i}.png`
    generateNaturalTexture(textureWidth, textureHeight, scale, filename)
  }
})
