import { MARKETS } from '../data/markets';
import { ADDONS } from '../data/addons';

/**
 * Calculate outbound call costs for all markets.
 */
export function calculateOutbound({ monthlyOutbound, avgDuration, answerRate, destType, numberPoolSize, jpNumberType, addons, shortCallRate }) {
  const res = {};

  Object.entries(MARKETS).forEach(([key, market]) => {
    const answered = Math.round(monthlyOutbound * (answerRate / 100));
    const unanswered = monthlyOutbound - answered;
    const billedMin = answered * Math.ceil(avgDuration);
    const outRate = destType === "mobile" ? market.outbound.mobile : market.outbound.landline;
    const breakdown = [];
    breakdown.push({ label: "通话费", value: Math.ceil(avgDuration) * outRate });

    let addonPerCall = 0;
    Object.entries(ADDONS).forEach(([ak, ad]) => {
      if (addons[ak]) {
        const v = ad.unit === "min" ? Math.ceil(avgDuration) * ad.price : ad.price;
        addonPerCall += v;
        breakdown.push({ label: ad.label, value: v });
      }
    });

    let rent;
    if (key === "jp") rent = jpNumberType === "national" ? market.numberRent.national : market.numberRent.local0ABJ;
    else rent = market.numberRent.local;
    const totalRent = numberPoolSize * rent;
    const rentPerCall = answered > 0 ? totalRent / answered : 0;
    breakdown.push({ label: `号码月租(${numberPoolSize}个)`, value: rentPerCall });

    let surchargeCost = 0, surchargeApplied = false, surchargeDetails = [];
    if (key === "us" && market.surcharge) {
      const unRate = unanswered / monthlyOutbound;
      if (unRate >= market.surcharge.threshold) {
        surchargeApplied = true;
        const c = unanswered * market.surcharge.unanswered;
        surchargeCost += c;
        surchargeDetails.push(`未接通率${(unRate * 100).toFixed(0)}%≥20%: +$${c.toFixed(2)}/月`);
      }
      if (shortCallRate >= 20) {
        surchargeApplied = true;
        const shortCalls = Math.round(answered * (shortCallRate / 100));
        const c = shortCalls * market.surcharge.unanswered;
        surchargeCost += c;
        surchargeDetails.push(`短呼(≤6s)占比${shortCallRate}%≥20%: +$${c.toFixed(2)}/月`);
      }
      if (avgDuration < 0.5) {
        surchargeApplied = true;
        const c = billedMin * market.surcharge.lowDuration;
        surchargeCost += c;
        surchargeDetails.push(`均时长<30s: +$${c.toFixed(2)}/月`);
      }
    }
    const surchargePerCall = answered > 0 ? surchargeCost / answered : 0;
    if (surchargeCost > 0) breakdown.push({ label: "⚠️ Surcharge", value: surchargePerCall });

    const perCall = Math.ceil(avgDuration) * outRate + addonPerCall + rentPerCall + surchargePerCall;
    const perMin = Math.ceil(avgDuration) > 0 ? perCall / Math.ceil(avgDuration) : 0;
    const monthly = billedMin * outRate + answered * addonPerCall + totalRent + surchargeCost;

    res[key] = { perCallTotal: perCall, perMinuteTotal: perMin, monthlyTotal: monthly, breakdown, surchargeApplied, surchargeDetails, answered, unanswered, billedMin };
  });

  return res;
}

/**
 * Calculate inbound call costs for all markets.
 */
export function calculateInbound({ inMonthly, inAvgDuration, inNumType, numberPoolSize, jpNumberType, addons }) {
  const res = {};

  Object.entries(MARKETS).forEach(([key, market]) => {
    const calls = inMonthly;
    const billedMin = calls * Math.ceil(inAvgDuration);
    const inRate = market.inbound[inNumType] || market.inbound.local;
    const breakdown = [];
    breakdown.push({ label: "接听费", value: Math.ceil(inAvgDuration) * inRate });

    let addonPerCall = 0;
    Object.entries(ADDONS).forEach(([ak, ad]) => {
      if (!addons[ak]) return;
      if (ak === "amd") return; // AMD not applicable for inbound
      const v = ad.unit === "min" ? Math.ceil(inAvgDuration) * ad.price : ad.price;
      addonPerCall += v;
      breakdown.push({ label: ad.label, value: v });
    });

    let rent;
    if (inNumType === "tollfree") {
      rent = market.numberRent.tollfree;
    } else {
      if (key === "jp") rent = jpNumberType === "national" ? market.numberRent.national : market.numberRent.local0ABJ;
      else rent = market.numberRent.local;
    }
    const totalRent = numberPoolSize * rent;
    const rentPerCall = calls > 0 ? totalRent / calls : 0;
    breakdown.push({ label: `号码月租(${numberPoolSize}个)`, value: rentPerCall });

    const perCall = Math.ceil(inAvgDuration) * inRate + addonPerCall + rentPerCall;
    const perMin = Math.ceil(inAvgDuration) > 0 ? perCall / Math.ceil(inAvgDuration) : 0;
    const monthly = billedMin * inRate + calls * addonPerCall + totalRent;

    res[key] = { perCallTotal: perCall, perMinuteTotal: perMin, monthlyTotal: monthly, breakdown, calls, billedMin };
  });

  return res;
}
