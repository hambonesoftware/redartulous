#!/usr/bin/env ts-node
import { scoreHit } from "../src/server/dartMath";

// Define test cases for scoring. Coordinates are normalized board coordinates.
interface TestCase {
  name: string;
  x: number;
  y: number;
  expectedLabel: string;
  expectedPoints: number;
}

const cases: TestCase[] = [
  { name: "Double bull", x: 0, y: 0, expectedLabel: "DBULL", expectedPoints: 50 },
  // Single bull must be outside the double bull radius (0.06) but inside the
  // single bull radius (0.13).
  { name: "Single bull", x: 0.10, y: 0, expectedLabel: "SBULL", expectedPoints: 25 },
  { name: "Miss outside", x: 1.1, y: 0, expectedLabel: "MISS", expectedPoints: 0 },
  { name: "Top wedge single", x: 0, y: 0.4, expectedLabel: "20", expectedPoints: 20 },
  // Wedge centers are at multiples of 18 degrees from the top (+Y), clockwise.
  // Wedge index 1 is number 1.
  {
    name: "Right of top wedge",
    x: 0.4 * Math.sin((2 * Math.PI) / 20),
    y: 0.4 * Math.cos((2 * Math.PI) / 20),
    expectedLabel: "1",
    expectedPoints: 1,
  },
  { name: "Triple 20", x: 0, y: 0.565, expectedLabel: "T20", expectedPoints: 60 },
  {
    name: "Triple 1",
    x: 0.565 * Math.sin((2 * Math.PI) / 20),
    y: 0.565 * Math.cos((2 * Math.PI) / 20),
    expectedLabel: "T1",
    expectedPoints: 3,
  },
  { name: "Double 20", x: 0, y: 0.96, expectedLabel: "D20", expectedPoints: 40 },
  {
    name: "Double 5",
    x: Math.sin((19 * 2 * Math.PI) / 20) * 0.96,
    y: Math.cos((19 * 2 * Math.PI) / 20) * 0.96,
    expectedLabel: "D5",
    expectedPoints: 10,
  },
  {
    name: "Just outside DBULL",
    x: 0.065,
    y: 0,
    expectedLabel: "SBULL",
    expectedPoints: 25,
  },
  // Additional canonical cases to exercise ring boundaries and wedge mapping
  {
    name: "Inside triple inner single ring (just below triple)",
    // Slightly smaller than tripleInner (0.53). Should score as single 20.
    x: 0,
    y: 0.525,
    expectedLabel: "20",
    expectedPoints: 20,
  },
  {
    name: "Outside triple outer single ring (just above triple)",
    // Slightly larger than tripleOuter (0.60). Should still score as single 20.
    x: 0,
    y: 0.605,
    expectedLabel: "20",
    expectedPoints: 20,
  },
  {
    name: "Triple 5",
    // Triple 5 is at wedge index 19 (two positions counter-clockwise from top).
    x: 0.565 * Math.sin((19 * 2 * Math.PI) / 20),
    y: 0.565 * Math.cos((19 * 2 * Math.PI) / 20),
    expectedLabel: "T5",
    expectedPoints: 15,
  },
  {
    name: "Single 14",
    // Single wedge for number 14 (wedge index 16). Radius inside single ring.
    x: 0.4 * Math.sin((16 * 2 * Math.PI) / 20),
    y: 0.4 * Math.cos((16 * 2 * Math.PI) / 20),
    expectedLabel: "14",
    expectedPoints: 14,
  },
];

function run(): void {
  let passed = 0;
  let failed = 0;
  cases.forEach((tc) => {
    const { segment } = scoreHit(tc.x, tc.y);
    const ok = segment.label === tc.expectedLabel && segment.points === tc.expectedPoints;
    if (ok) passed++;
    else failed++;
    console.log(
      `${tc.name}: hit label=${segment.label} points=${segment.points} -> ` +
        (ok ? "PASS" : `FAIL (expected ${tc.expectedLabel}/${tc.expectedPoints})`)
    );
  });
  console.log(`\n${passed} passed, ${failed} failed out of ${cases.length}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();