/**
* @description Generate colorful and natural textures for use in 3D models.
* @module generateTextures.test
* @version 0.0.2
* @requires perlin-noise
* @requires files
**/

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { before, describe, it } from 'mocha';
import * as perlin from 'perlin-noise';

import { deleteFilesInDirectory } from '../utils/files';

describe('Generate textures', () => {
  describe('Natural textures', () => {
    it('should create 6 files with natural textures', async () => {
      const textureWidth = 500
      const textureHeight = 500
      const scale = 0.02
      for (let i = 1; i <= 6; i++) {
        const filename = `assets/textures/natural_texture_${i}.png`
        generateNaturalTexture(textureWidth, textureHeight, scale, filename)
      }
    })
  })
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
before(() => {
  if (typeof deleteFilesInDirectory === 'function') {
    deleteFilesInDirectory('assets/textures')
  }
})

/**
 * Generates a natural texture using Perlin noise and saves it as a PNG file.
 *
 * @param {number} width - The width of the texture.
 * @param {number} height - The height of the texture.
 * @param {string} filename - The name of the file to save the texture as.
 */
function generateNaturalTexture(width, height, scale, filename) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  /** @type {number[]} */
  const noise = perlin.generatePerlinNoise(width, height, {
    octaveCount: 6,
    amplitude: 0.1,
    persistence: 0.2,
  })

  // Draw the pattern on the canvas based on the Perlin noise
  for (let x = 0; x < width; x++) {
    function generateNaturalTexture(width, height, filename) {
      const value = noise?.[x * height + y] || 0
      const color = Math.floor((value + 1) * 128)
      ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
      ctx.fillRect(x, y, 1, 1)
    }
  }

  // Save the canvas as a PNG file
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(filename, buffer)
}
