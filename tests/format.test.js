import { describe, it, expect } from 'vitest';
import { fmtUSD } from '../src/utils/format';

describe('fmtUSD', () => {
  it('formats values >= 1000 with commas and 2 decimals', () => {
    expect(fmtUSD(1000)).toBe('$1,000.00');
    expect(fmtUSD(12345.678)).toBe('$12,345.68');
  });

  it('formats values >= 1 with 2 decimals', () => {
    expect(fmtUSD(1)).toBe('$1.00');
    expect(fmtUSD(99.99)).toBe('$99.99');
    expect(fmtUSD(5.5)).toBe('$5.50');
  });

  it('formats values < 1 with 4 decimals', () => {
    expect(fmtUSD(0.014)).toBe('$0.0140');
    expect(fmtUSD(0.0025)).toBe('$0.0025');
    expect(fmtUSD(0.185)).toBe('$0.1850');
  });

  it('formats zero', () => {
    expect(fmtUSD(0)).toBe('$0.0000');
  });
});
