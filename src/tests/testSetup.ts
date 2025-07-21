/**
 * File:        /tests/testSetup.js
 * Description: This file contains the global setup for Jest testing.
 * 2024-01-14  C2RLO  Initial
 */

import { expect } from '@jest/globals'
import * as matchers from 'jest-extended'
expect.extend(matchers)
