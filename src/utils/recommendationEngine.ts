/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FaceScanResult, HealthRecommendation } from '../types';

/**
 * Fetches personalized recommendations from server-side Gemini endpoint or algorithmic fallback
 */
export async function fetchPersonalizedRecommendations(scan: FaceScanResult): Promise<HealthRecommendation[]> {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scan }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
      return data.recommendations;
    }
    throw new Error('Empty recommendations array returned');
  } catch (err) {
    console.warn('Falling back to local algorithmic recommendation generator:', err);
    return computeClientRecommendations(scan);
  }
}

/**
 * Algorithmic rule-based personalized recommendation generator
 */
export function computeClientRecommendations(scan: FaceScanResult): HealthRecommendation[] {
  const hr = scan.vitals?.heartRate?.value || 72;
  const stress = scan.vitals?.stress?.score || 35;
  const glucose = scan.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 92;
  const glycemicScore = scan.vitals?.bloodSugarRisk?.glycemicStabilityScore || 85;
  const hrv = scan.vitals?.hrv?.rmssdMs || 48;
  const isHighStress = stress > 48;
  const isHighSugar = glucose > 102;
  const isHighHr = hr > 84;

  const recs: HealthRecommendation[] = [];

  // 1. HYDRATION RECOMMENDATION
  if (isHighSugar || isHighStress) {
    recs.push({
      id: 'rec_hyd_1',
      category: 'hydration',
      title: 'Targeted Electrolyte & Mineral Rehydration',
      actionText: 'Drink 450ml - 500ml of mineralized water with a pinch of unrefined sea salt or potassium-magnesium electrolytes.',
      rationale: `Your current scan registers ${stress}% autonomic stress and ${glucose} mg/dL estimated blood sugar. Mineralized hydration reduces blood viscosity, supports renal glucose filtering, and restores capillary pulsatility.`,
      priority: 'high',
      impactBadge: 'Perfusion +14%',
      timeframe: 'Immediate (Next 15m)',
      actionType: 'hydration_log',
    });
  } else {
    recs.push({
      id: 'rec_hyd_2',
      category: 'hydration',
      title: 'Cellular Hydration & Capillary Maintenance',
      actionText: 'Sip 350ml of room-temperature water with fresh citrus to sustain micro-vascular blood volume.',
      rationale: 'Adequate hydration maintains optimal optical pulse signal quality and steady resting stroke volume.',
      priority: 'routine',
      impactBadge: 'Optimal Perfusion',
      timeframe: 'Throughout Morning',
      actionType: 'hydration_log',
    });
  }

  // 2. RELAXATION / BREATHING EXERCISE
  if (isHighStress || isHighHr) {
    recs.push({
      id: 'rec_rel_1',
      category: 'relaxation',
      title: '4-7-8 Diaphragmatic Vagus Nerve Reset',
      actionText: 'Inhale through nose for 4s, hold for 7s, exhale slowly through mouth for 8s. Repeat for 4 consecutive cycles (approx 3 minutes).',
      rationale: `Autonomic stress score is ${stress}/100 with sympathetic predominance. Prolonged exhalations stimulate the vagus nerve, rapidly lowering resting heart rate (${hr} BPM) and down-regulating acute cortisol surges.`,
      priority: 'high',
      impactBadge: '-18% Sympathetic Load',
      timeframe: 'Next 10 Minutes',
      actionType: 'breathing',
    });
  } else {
    recs.push({
      id: 'rec_rel_2',
      category: 'relaxation',
      title: 'Resonance Coherence Breathing (5.5s Pace)',
      actionText: 'Complete 3 minutes of rhythmic diaphragmatic breathing at 5.5s inhale / 5.5s exhale (6 breaths/min).',
      rationale: `Your HRV is ${hrv} ms. Resonance frequency pacing synchronizes baroreflex activity with respiratory sinus arrhythmia to optimize cognitive resilience.`,
      priority: 'routine',
      impactBadge: '+22% HRV Adaptability',
      timeframe: 'Midday Break',
      actionType: 'breathing',
    });
  }

  // 3. NUTRITION & GLYCEMIC ADJUSTMENT
  if (isHighSugar) {
    recs.push({
      id: 'rec_nut_1',
      category: 'nutrition',
      title: 'Glycemic Shield: Fiber & Protein First Sequencing',
      actionText: 'Sequence your upcoming meal by consuming leafy greens or non-starchy vegetables first, proteins and fats second, and starches/carbs last. Take 1 tbsp apple cider vinegar in water 10 minutes prior.',
      rationale: `Estimated fasting/baseline glucose proxy is ${glucose} mg/dL. Fiber creates a viscous mesh in the upper intestine that delays glucose absorption, reducing postprandial glucose peaks by up to 35%.`,
      priority: 'high',
      impactBadge: '-28% Glucose Surge',
      timeframe: 'Before Next Meal',
      actionType: 'diet_swap',
    });
  } else {
    recs.push({
      id: 'rec_nut_2',
      category: 'nutrition',
      title: 'Steady-State Low-Glycemic Fueling Protocol',
      actionText: 'Pair complex carbohydrates with monounsaturated fats (avocado, extra virgin olive oil, pumpkin seeds) to preserve metabolic stability.',
      rationale: `Your glycemic stability index is ${glycemicScore}/100. Adding healthy fats slows gastric emptying and ensures sustained cellular energy without insulin rollercoasters.`,
      priority: 'medium',
      impactBadge: 'Stable Glycemic Curve',
      timeframe: 'With Next Meal',
      actionType: 'diet_swap',
    });
  }

  // 4. CARDIOVASCULAR & MOVEMENT
  recs.push({
    id: 'rec_card_1',
    category: 'cardiovascular',
    title: '10-Minute Postprandial Stroll (GLUT4 Activation)',
    actionText: 'Engage in an easy 10 to 15-minute zone-1 stroll within 30 minutes after your main meal.',
    rationale: 'Mild skeletal muscle contractions activate non-insulin dependent GLUT4 glucose transporters, clearing circulating glucose from the bloodstream with minimal cardiovascular strain.',
    priority: isHighSugar ? 'high' : 'medium',
    impactBadge: '-15 mg/dL Post-Meal Glucose',
    timeframe: 'Post-Meal',
    actionType: 'walk_timer',
  });

  // 5. CIRCADIAN & SLEEP
  recs.push({
    id: 'rec_circ_1',
    category: 'circadian',
    title: 'Circadian Melatonin Guard & Thermal Reset',
    actionText: 'Dim blue lighting 90 minutes before sleep and ventilate bedroom to 65-68°F (18-20°C).',
    rationale: 'Uninterrupted slow-wave sleep enhances next-day insulin sensitivity and restores parasympathetic autonomic reserves for lower resting heart rates.',
    priority: 'routine',
    impactBadge: '+18% Recovery Reserve',
    timeframe: 'Tonight (90m Pre-Sleep)',
    actionType: 'none',
  });

  return recs;
}
