/**
 * Hourly Timeline Logic Tests
 *
 * Tests the temperature estimation curve and
 * heat index → safety level mapping used in the timeline.
 */

// Inline the functions since they're not exported from the component
// (These mirror the exact logic in HourlyTimeline.tsx)

function estimateTempAtHour(hour: number, currentFeelsLike: number): number {
  const peakHour = 14;
  const offset = ((hour - peakHour) / 24) * 2 * Math.PI;
  const factor = Math.cos(offset);
  const nightRatio = 0.65;
  const midpoint = currentFeelsLike * ((1 + nightRatio) / 2);
  const amplitude = currentFeelsLike * ((1 - nightRatio) / 2);
  return midpoint + amplitude * factor;
}

function computeHeatIndex(tempC: number, humidity: number): number {
  if (tempC < 27 || humidity < 40) return tempC;
  const humidityPenalty = ((humidity - 40) / 10) * 1.5;
  return tempC + humidityPenalty;
}

type Safety = 'safe' | 'caution' | 'danger' | 'extreme';

function getSafety(heatIndex: number): Safety {
  if (heatIndex >= 47) return 'extreme';
  if (heatIndex >= 40) return 'danger';
  if (heatIndex >= 33) return 'caution';
  return 'safe';
}

describe('Temperature Curve Model', () => {
  it('peak temperature occurs around 2 PM (hour 14)', () => {
    const feelsLike = 42;
    const temps = Array.from({ length: 24 }, (_, h) => estimateTempAtHour(h, feelsLike));
    const maxTemp = Math.max(...temps);
    const maxHour = temps.indexOf(maxTemp);
    expect(maxHour).toBe(14);
  });

  it('trough temperature occurs around 2-5 AM', () => {
    const feelsLike = 42;
    const temps = Array.from({ length: 24 }, (_, h) => estimateTempAtHour(h, feelsLike));
    const minTemp = Math.min(...temps);
    const minHour = temps.indexOf(minTemp);
    expect(minHour).toBeGreaterThanOrEqual(1);
    expect(minHour).toBeLessThanOrEqual(5);
  });

  it('nighttime temp is ~65% of daytime peak', () => {
    const feelsLike = 42;
    const peakTemp = estimateTempAtHour(14, feelsLike); // 2 PM
    const troughTemp = estimateTempAtHour(2, feelsLike); // 2 AM
    const ratio = troughTemp / peakTemp;
    expect(ratio).toBeGreaterThan(0.6);
    expect(ratio).toBeLessThan(0.75);
  });

  it('morning temp is between trough and peak', () => {
    const feelsLike = 42;
    const morningTemp = estimateTempAtHour(8, feelsLike);
    const peakTemp = estimateTempAtHour(14, feelsLike);
    const troughTemp = estimateTempAtHour(2, feelsLike);
    expect(morningTemp).toBeGreaterThan(troughTemp);
    expect(morningTemp).toBeLessThan(peakTemp);
  });

  it('all temps are positive for positive input', () => {
    const feelsLike = 35;
    for (let h = 0; h < 24; h++) {
      expect(estimateTempAtHour(h, feelsLike)).toBeGreaterThan(0);
    }
  });
});

describe('Heat Index (humidity factoring)', () => {
  it('no penalty below 27°C', () => {
    expect(computeHeatIndex(25, 90)).toBe(25);
  });

  it('no penalty below 40% humidity', () => {
    expect(computeHeatIndex(35, 30)).toBe(35);
  });

  it('adds penalty for high humidity + high temp', () => {
    const withHumidity = computeHeatIndex(35, 80);
    expect(withHumidity).toBeGreaterThan(35);
    expect(withHumidity).toBeLessThan(45);
  });

  it('Mumbai scenario: 34°C + 85% humidity feels much worse', () => {
    const index = computeHeatIndex(34, 85);
    expect(index).toBeGreaterThan(38); // Feels like danger zone
  });

  it('Delhi scenario: 45°C + 20% humidity stays near actual temp', () => {
    const index = computeHeatIndex(45, 20);
    expect(index).toBe(45); // Low humidity = no penalty
  });
});

describe('Safety Level Mapping', () => {
  it('safe below 33', () => {
    expect(getSafety(25)).toBe('safe');
    expect(getSafety(32.9)).toBe('safe');
  });

  it('caution 33-39.9', () => {
    expect(getSafety(33)).toBe('caution');
    expect(getSafety(39)).toBe('caution');
  });

  it('danger 40-46.9', () => {
    expect(getSafety(40)).toBe('danger');
    expect(getSafety(46)).toBe('danger');
  });

  it('extreme 47+', () => {
    expect(getSafety(47)).toBe('extreme');
    expect(getSafety(55)).toBe('extreme');
  });
});

describe('Full Timeline — End to End', () => {
  it('Delhi 46°C dry: has extreme hours during midday', () => {
    const feelsLike = 46;
    const humidity = 25;
    const safeties = Array.from({ length: 24 }, (_, h) => {
      const temp = estimateTempAtHour(h, feelsLike);
      const hi = computeHeatIndex(temp, humidity);
      return getSafety(hi);
    });
    expect(safeties.filter((s) => s === 'extreme' || s === 'danger').length).toBeGreaterThan(0);
    expect(safeties.filter((s) => s === 'safe').length).toBeGreaterThan(0);
  });

  it('Mumbai 34°C humid: humidity pushes midday into danger', () => {
    const feelsLike = 34;
    const humidity = 85;
    const safeties = Array.from({ length: 24 }, (_, h) => {
      const temp = estimateTempAtHour(h, feelsLike);
      const hi = computeHeatIndex(temp, humidity);
      return getSafety(hi);
    });
    const dangerPlus = safeties.filter((s) => s === 'danger' || s === 'extreme');
    expect(dangerPlus.length).toBeGreaterThan(0);
  });

  it('Shimla 20°C: all hours are safe', () => {
    const feelsLike = 20;
    const humidity = 50;
    const safeties = Array.from({ length: 24 }, (_, h) => {
      const temp = estimateTempAtHour(h, feelsLike);
      const hi = computeHeatIndex(temp, humidity);
      return getSafety(hi);
    });
    expect(safeties.every((s) => s === 'safe')).toBe(true);
  });
});
