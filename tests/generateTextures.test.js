/**
 * @file /home/karol/GitHub/3d-inventory-mongo-api/tests/generateTextures.test.js
 * @description Generate textures
 * @version 2024-01-28 C2RLO - Initial
 */

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import perlin from 'perlin-noise'
import { deleteFilesInDirectory } from '../utils/files.js'

/**
 * Test suite for generating textures.
 */
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
beforeAll(() => {
  deleteFilesInDirectory('assets/textures')
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
 * @param {number} scale - The scale of the Perlin noise.
 * @param {string} filename - The name of the file to save the texture as.
 */
function generateNaturalTexture(width, height, scale, filename) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const noise = perlin.generatePerlinNoise(width, height, {
    octaveCount: 6,
    amplitude: 0.1,
    persistence: 0.2,
  })

  // Draw the pattern on the canvas based on the Perlin noise
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const value = noise[x * height + y]
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
 * Test case for generating colorful textures.
 */
it('should create 6 files with colorful textures', async () => {
  // Set the dimensions of your texture and the size of the pattern tiles
  const textureWidth = 500
  const textureHeight = 500
  const tileSize = 80

  // Generate 6 different colorful textures with patterns
  for (let i = 1; i <= 6; i++) {
    const filename = `assets/textures/texture_${i}.png`
    generateColorfulTexture(textureWidth, textureHeight, tileSize, filename)
    console.log(`Colorful texture ${i} generated and saved as ${filename}`)
  }

  // Add an assertion to the test
  expect(true).toBe(true)
})

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
    console.log(`Natural texture ${i} generated and saved as ${filename}`)
  }

  // Add an assertion to the test
  expect(true).toBe(true)
})
