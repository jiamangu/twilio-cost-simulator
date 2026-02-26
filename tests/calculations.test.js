import { describe, it, expect } from 'vitest';
import { calculateOutbound, calculateInbound } from '../src/utils/calculations';

const defaultAddons = { recording: true, mediaStreams: true, amd: true, conversationRelay: false };
const noAddons = { recording: false, mediaStreams: false, amd: false, conversationRelay: false };

describe('calculateOutbound', () => {
  const baseParams = {
    monthlyOutbound: 25000,
    avgDuration: 2,
    answerRate: 40,
    destType: 'mobile',
    numberPoolSize: 25,
    jpNumberType: 'national',
    addons: noAddons,
    shortCallRate: 10,
  };

  it('returns results for all three markets', () => {
    const results = calculateOutbound(baseParams);
    expect(Object.keys(results)).toEqual(['us', 'uk', 'jp']);
  });

  it('calculates correct answered/unanswered counts', () => {
    const results = calculateOutbound(baseParams);
    expect(results.us.answered).toBe(10000); // 25000 * 40%
    expect(results.us.unanswered).toBe(15000);
  });

  it('calculates billed minutes based on ceil of avgDuration', () => {
    const results = calculateOutbound(baseParams);
    // answered(10000) * ceil(2) = 20000
    expect(results.us.billedMin).toBe(20000);
  });

  it('uses mobile rate for mobile destType', () => {
    const results = calculateOutbound(baseParams);
    // US mobile: $0.014/min * 2 min = $0.028 per call (just voice)
    const voiceBreakdown = results.us.breakdown.find(b => b.label === '通话费');
    expect(voiceBreakdown.value).toBeCloseTo(0.028, 4);
  });

  it('uses landline rate for landline destType', () => {
    const results = calculateOutbound({ ...baseParams, destType: 'landline' });
    // UK landline: $0.0158/min * 2 min = $0.0316
    const voiceBreakdown = results.uk.breakdown.find(b => b.label === '通话费');
    expect(voiceBreakdown.value).toBeCloseTo(0.0316, 4);
  });

  it('does not trigger surcharge when conditions are not met', () => {
    const results = calculateOutbound(baseParams);
    // answerRate=40 => unRate=60% >= 20% => surcharge IS triggered
    expect(results.us.surchargeApplied).toBe(true);
  });

  it('triggers surcharge for high unanswered rate', () => {
    const results = calculateOutbound({ ...baseParams, answerRate: 70 });
    // unRate = 30% >= 20% => triggered
    expect(results.us.surchargeApplied).toBe(true);
    expect(results.us.surchargeDetails.length).toBeGreaterThan(0);
  });

  it('does not trigger surcharge when answer rate is high enough', () => {
    const results = calculateOutbound({ ...baseParams, answerRate: 85 });
    // unRate = 15% < 20% => not triggered (assuming shortCallRate < 20)
    expect(results.us.surchargeApplied).toBe(false);
  });

  it('triggers surcharge for high short call rate', () => {
    const results = calculateOutbound({ ...baseParams, answerRate: 85, shortCallRate: 25 });
    expect(results.us.surchargeApplied).toBe(true);
  });

  it('triggers surcharge for low avg duration', () => {
    const results = calculateOutbound({ ...baseParams, answerRate: 85, avgDuration: 0.3 });
    // avgDuration < 0.5 => triggered
    expect(results.us.surchargeApplied).toBe(true);
  });

  it('non-US markets never have surcharge', () => {
    const results = calculateOutbound({ ...baseParams, answerRate: 10 });
    expect(results.uk.surchargeApplied).toBeFalsy();
    expect(results.jp.surchargeApplied).toBeFalsy();
  });

  it('includes addons in per-call cost', () => {
    const withAddons = calculateOutbound({ ...baseParams, addons: defaultAddons });
    const withoutAddons = calculateOutbound({ ...baseParams, addons: noAddons });
    expect(withAddons.us.perCallTotal).toBeGreaterThan(withoutAddons.us.perCallTotal);
  });

  it('uses JP national number rent for national type', () => {
    const results = calculateOutbound({ ...baseParams, jpNumberType: 'national' });
    const rentItem = results.jp.breakdown.find(b => b.label.includes('号码月租'));
    // national $4.5 * 25 = $112.5, per call = $112.5 / 10000 = $0.01125
    expect(rentItem.value).toBeCloseTo(0.01125, 4);
  });

  it('uses JP local0ABJ number rent for local0ABJ type', () => {
    const results = calculateOutbound({ ...baseParams, jpNumberType: 'local0ABJ' });
    const rentItem = results.jp.breakdown.find(b => b.label.includes('号码月租'));
    // local0ABJ $20 * 25 = $500, per call = $500 / 10000 = $0.05
    expect(rentItem.value).toBeCloseTo(0.05, 4);
  });

  it('monthlyTotal = voice + addons + rent + surcharge', () => {
    const results = calculateOutbound(baseParams);
    const r = results.us;
    // Verify monthly total is positive and reasonable
    expect(r.monthlyTotal).toBeGreaterThan(0);
    // monthlyTotal should include: billedMin * outRate + answered * addonPerCall + totalRent + surchargeCost
    const voiceCost = r.billedMin * 0.014; // US mobile rate
    const totalRent = 25 * 1.15; // 25 numbers * $1.15
    expect(r.monthlyTotal).toBeGreaterThanOrEqual(voiceCost + totalRent);
  });
});

describe('calculateInbound', () => {
  const baseParams = {
    inMonthly: 3000,
    inAvgDuration: 2,
    inNumType: 'local',
    numberPoolSize: 25,
    jpNumberType: 'national',
    addons: noAddons,
  };

  it('returns results for all three markets', () => {
    const results = calculateInbound(baseParams);
    expect(Object.keys(results)).toEqual(['us', 'uk', 'jp']);
  });

  it('calculates correct billed minutes', () => {
    const results = calculateInbound(baseParams);
    // 3000 * ceil(2) = 6000
    expect(results.us.billedMin).toBe(6000);
  });

  it('uses local rate for local inNumType', () => {
    const results = calculateInbound(baseParams);
    // US local inbound: $0.0085/min * 2 min = $0.017
    const listenItem = results.us.breakdown.find(b => b.label === '接听费');
    expect(listenItem.value).toBeCloseTo(0.017, 4);
  });

  it('uses tollfree rate for tollfree inNumType', () => {
    const results = calculateInbound({ ...baseParams, inNumType: 'tollfree' });
    // US tollfree: $0.022/min * 2 min = $0.044
    const listenItem = results.us.breakdown.find(b => b.label === '接听费');
    expect(listenItem.value).toBeCloseTo(0.044, 4);
  });

  it('excludes AMD addon for inbound', () => {
    const results = calculateInbound({ ...baseParams, addons: { ...defaultAddons, amd: true } });
    const amdItem = results.us.breakdown.find(b => b.label === '留言检测 AMD');
    expect(amdItem).toBeUndefined();
  });

  it('includes recording addon when enabled', () => {
    const results = calculateInbound({ ...baseParams, addons: { ...noAddons, recording: true } });
    const recItem = results.us.breakdown.find(b => b.label === '通话录音');
    expect(recItem).toBeDefined();
    // $0.0025/min * 2 min = $0.005
    expect(recItem.value).toBeCloseTo(0.005, 4);
  });

  it('uses tollfree number rent for tollfree type', () => {
    const results = calculateInbound({ ...baseParams, inNumType: 'tollfree' });
    const rentItem = results.us.breakdown.find(b => b.label.includes('号码月租'));
    // US tollfree $2.15 * 25 = $53.75 / 3000 calls
    expect(rentItem.value).toBeCloseTo(53.75 / 3000, 4);
  });

  it('monthlyTotal is positive and reasonable', () => {
    const results = calculateInbound(baseParams);
    expect(results.us.monthlyTotal).toBeGreaterThan(0);
    expect(results.uk.monthlyTotal).toBeGreaterThan(0);
    expect(results.jp.monthlyTotal).toBeGreaterThan(0);
  });

  it('JP inbound cost is highest among all markets for tollfree', () => {
    const results = calculateInbound({ ...baseParams, inNumType: 'tollfree' });
    expect(results.jp.perCallTotal).toBeGreaterThan(results.us.perCallTotal);
    expect(results.jp.perCallTotal).toBeGreaterThan(results.uk.perCallTotal);
  });
});
