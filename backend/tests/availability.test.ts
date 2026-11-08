import { describe, it, expect } from 'vitest';

describe('Availability Overlap Logic Engine', () => {
  function checkIntervalOverlap(
    existingStart: Date,
    existingEnd: Date,
    reqStart: Date,
    reqEnd: Date
  ): boolean {
    // standard interval overlap condition:
    // existingStart < requestedEnd AND existingEnd > requestedStart
    return existingStart < reqEnd && existingEnd > reqStart;
  }

  const existingStart = new Date('2026-12-10T10:00:00Z');
  const existingEnd = new Date('2026-12-15T10:00:00Z');

  it('detects direct overlap: requested booking inside existing booking', () => {
    const reqStart = new Date('2026-12-11T10:00:00Z');
    const reqEnd = new Date('2026-12-14T10:00:00Z');
    expect(checkIntervalOverlap(existingStart, existingEnd, reqStart, reqEnd)).toBe(true);
  });

  it('detects overlap: requested booking spans over existing booking', () => {
    const reqStart = new Date('2026-12-08T10:00:00Z');
    const reqEnd = new Date('2026-12-18T10:00:00Z');
    expect(checkIntervalOverlap(existingStart, existingEnd, reqStart, reqEnd)).toBe(true);
  });

  it('detects overlap: requested booking starts before and overlaps start', () => {
    const reqStart = new Date('2026-12-08T10:00:00Z');
    const reqEnd = new Date('2026-12-12T10:00:00Z');
    expect(checkIntervalOverlap(existingStart, existingEnd, reqStart, reqEnd)).toBe(true);
  });

  it('detects overlap: requested booking overlaps end', () => {
    const reqStart = new Date('2026-12-14T10:00:00Z');
    const reqEnd = new Date('2026-12-18T10:00:00Z');
    expect(checkIntervalOverlap(existingStart, existingEnd, reqStart, reqEnd)).toBe(true);
  });

  it('allows non-overlapping booking strictly before existing booking', () => {
    const reqStart = new Date('2026-12-05T10:00:00Z');
    const reqEnd = new Date('2026-12-10T10:00:00Z'); // ends exactly when existing starts
    expect(checkIntervalOverlap(existingStart, existingEnd, reqStart, reqEnd)).toBe(false);
  });

  it('allows non-overlapping booking strictly after existing booking', () => {
    const reqStart = new Date('2026-12-15T10:00:00Z'); // starts exactly when existing ends
    const reqEnd = new Date('2026-12-20T10:00:00Z');
    expect(checkIntervalOverlap(existingStart, existingEnd, reqStart, reqEnd)).toBe(false);
  });
});
