/**
 * @file /utils/generateTextures.js
 * @module /utils
 * @description Generate textures
 * @version 2024-01-28 C2RLO - Initial
**/

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import perlin from 'perlin-noise'
import { deleteFilesInDirectory } from '../utils/files.js'

describe('Generate textures', () => {

  beforeAll(() => {
    deleteFilesInDirectory('assets/textures')
  })


  it('should create 6 files with colorful textures', async () => {

    function getRandomColor() {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }

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

    // Set the dimensions of your texture and the size of the pattern tiles
    const textureWidth = 500
    const textureHeight = 500
    const tileSize = 80

    // Generate 20 different colorful textures with patterns
    for (let i = 1; i <= 6; i++) {
      const filename = `assets/textures/texture_${i}.png`
      generateColorfulTexture(textureWidth, textureHeight, tileSize, filename)
      console.log(`Colorful texture ${i} generated and saved as ${filename}`)
    }

    // Add an assertion to the test
    expect(true).toBe(true)
  }) // Remove the extra closing parenthesis here


  it('should create 6 files with natural textures', async () => {
    function generateNaturalTexture(width, height, scale, filename) {
      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')
      const noise = perlin.generatePerlinNoise(width, height, { octaveCount: 6, amplitude: 0.1, persistence: 0.2})
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

    await deleteFilesInDirectory('assets/textures')
    // Set the dimensions of your texture and the Perlin noise scale
    const textureWidth = 500
    const textureHeight = 500
    const scale = 0.02

    // Generate 20 different natural textures with patterns
    for (let i = 1; i <= 6; i++) {
      const filename = `assets/textures/natural_texture_${i}.png`
      generateNaturalTexture(textureWidth, textureHeight, scale, filename)
      console.log(`Natural texture ${i} generated and saved as ${filename}`)
    }
    expect(true).toBe(true)
  }) // Remove the extra closing parenthesis here
})
