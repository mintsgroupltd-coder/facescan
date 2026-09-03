/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FaceScanResult } from '../types';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';

const STORAGE_KEY = 'facevital_scan_history';

/**
 * Generates a realistic synthetic historical dataset across past 90 days
 * to demonstrate days, weeks, and months tracking trends.
 */
export function generateRealisticHistoricalData(daysCount = 45): FaceScanResult[] {
  const results: FaceScanResult[] = [];
  const now = new Date();

  // Baseline metrics for a healthy individual with realistic variations
  let baseRestingHR = 65;
  let baseStress = 35;
  let baseGlucose = 88;

  // Generate 1-3 readings per day for the last N days
  for (let d = daysCount - 1; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const dayOfWeek = dayDate.getDay(); // 0 is Sun, 6 is Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Slight weekend relaxation effect
    const weekendStressMod = isWeekend ? -12 : (dayOfWeek === 3 || dayOfWeek === 4 ? +8 : 0);

    // Progressive fitness improvement trend over time
    const fitnessProgress = (daysCount - d) / daysCount; // 0 to 1
    const currentBaseHR = Math.round(baseRestingHR - fitnessProgress * 3); // Drops 3 bpm as fitness improves
    const currentBaseStress = Math.max(15, Math.round(baseStress + weekendStressMod - fitnessProgress * 5));

    // Reading 1: Morning Fasting (7:30 AM - 8:30 AM)
    const morningDate = new Date(dayDate);
    morningDate.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

    const morningHR = Math.round(currentBaseHR + (Math.random() * 6 - 3));
    const morningStress = Math.max(10, Math.round(currentBaseStress * 0.7 + (Math.random() * 8 - 4)));
    const morningGlucose = Math.round(baseGlucose + (Math.random() * 8 - 4));
    const morningHrv = Math.round(68 + fitnessProgress * 8 + (Math.random() * 10 - 5));

    results.push(createSyntheticScan({
      id: `hist_morn_${d}`,
      timestamp: morningDate.toISOString(),
      sourceMode: d === 0 ? 'live_webcam' : (d % 3 === 0 ? 'live_webcam' : 'sample_profile'),
      userNotes: 'Morning resting baseline (fasting)',
      hr: morningHR,
      stress: morningStress,
      glucose: morningGlucose,
      glucoseLevel: morningGlucose <= 99 ? 'Optimal' : 'Normal',
      hrv: morningHrv,
      systolic: 114 + Math.round(Math.random() * 6 - 3),
      diastolic: 72 + Math.round(Math.random() * 4 - 2),
      spO2: 98 + Math.round(Math.random()),
      respiration: 13 + Math.round(Math.random() * 2),
    }));

    // Reading 2: Postprandial / Afternoon (1:30 PM - 3:00 PM) - 80% of days
    if (Math.random() > 0.2) {
      const afternoonDate = new Date(dayDate);
      afternoonDate.setHours(13 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);

      const hadCarbMeal = Math.random() > 0.6;
      const afternoonHR = Math.round(currentBaseHR + (hadCarbMeal ? 16 : 8) + (Math.random() * 6 - 3));
      const afternoonStress = Math.min(95, Math.round(currentBaseStress * 1.3 + (isWeekend ? -5 : 10) + (Math.random() * 10 - 5)));
      const afternoonGlucose = Math.round(baseGlucose + (hadCarbMeal ? 38 + Math.random() * 20 : 16 + Math.random() * 10));
      const afternoonHrv = Math.max(25, Math.round(morningHrv * 0.7 - (afternoonStress > 60 ? 15 : 5)));

      results.push(createSyntheticScan({
        id: `hist_aft_${d}`,
        timestamp: afternoonDate.toISOString(),
        sourceMode: 'sample_profile',
        userNotes: hadCarbMeal ? 'Post-lunch glycemic response' : 'Midday work check-in',
        hr: afternoonHR,
        stress: afternoonStress,
        glucose: afternoonGlucose,
        glucoseLevel: afternoonGlucose > 125 ? 'Elevated Glycemic Risk' : (afternoonGlucose > 100 ? 'Pre-diabetic Watch' : 'Normal'),
        hrv: afternoonHrv,
        systolic: 122 + Math.round(Math.random() * 8 - 4),
        diastolic: 78 + Math.round(Math.random() * 4 - 2),
        spO2: 97 + Math.round(Math.random() * 2),
        respiration: 16 + Math.round(Math.random() * 3),
      }));
    }

    // Reading 3: Evening / Night (8:30 PM - 10:00 PM) - 60% of days
    if (Math.random() > 0.4) {
      const eveningDate = new Date(dayDate);
      eveningDate.setHours(20 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

      const eveningHR = Math.round(currentBaseHR + 2 + (Math.random() * 6 - 3));
      const eveningStress = Math.max(15, Math.round(currentBaseStress * 0.85 + (Math.random() * 8 - 4)));
      const eveningGlucose = Math.round(baseGlucose + 6 + (Math.random() * 8 - 4));
      const eveningHrv = Math.round(morningHrv * 0.9 + (Math.random() * 8 - 4));

      results.push(createSyntheticScan({
        id: `hist_eve_${d}`,
        timestamp: eveningDate.toISOString(),
        sourceMode: 'sample_profile',
        userNotes: 'Evening wind-down reading',
        hr: eveningHR,
        stress: eveningStress,
        glucose: eveningGlucose,
        glucoseLevel: eveningGlucose <= 99 ? 'Optimal' : 'Normal',
        hrv: eveningHrv,
        systolic: 116 + Math.round(Math.random() * 6 - 3),
        diastolic: 74 + Math.round(Math.random() * 4 - 2),
        spO2: 98 + Math.round(Math.random()),
        respiration: 14 + Math.round(Math.random() * 2),
      }));
    }
  }

  // Sort descending by timestamp (newest first)
  return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function createSyntheticScan(params: {
  id: string;
  timestamp: string;
  sourceMode: 'live_webcam' | 'sample_profile' | 'uploaded_image';
  userNotes?: string;
  hr: number;
  stress: number;
  glucose: number;
  glucoseLevel: 'Optimal' | 'Normal' | 'Pre-diabetic Watch' | 'Elevated Glycemic Risk';
  hrv: number;
  systolic: number;
  diastolic: number;
  spO2: number;
  respiration: number;
}): FaceScanResult {
  const stressCategory = params.stress < 30 ? 'Low / Relaxed' : (params.stress < 60 ? 'Moderate' : (params.stress < 80 ? 'Elevated' : 'High Stress'));
  const hrStatus = params.hr < 60 ? 'optimal' : (params.hr <= 85 ? 'normal' : (params.hr <= 100 ? 'moderate' : 'elevated'));

  const map = Number((params.diastolic + (params.systolic - params.diastolic) / 3).toFixed(1));
  const pulsePressure = params.systolic - params.diastolic;
  const bpCategory = params.systolic >= 140 || params.diastolic >= 90
    ? 'Stage 2 Hypertension'
    : params.systolic >= 130 || params.diastolic >= 80
    ? 'Stage 1 Hypertension'
    : params.systolic >= 120
    ? 'Elevated'
    : 'Normal';

  const asi = Math.min(95, Math.max(15, Math.round(30 + (params.systolic - 110) * 0.8 + params.stress * 0.2)));
  const pwv = Number((6.2 + (params.systolic - 110) * 0.04 + (params.stress * 0.015)).toFixed(1));
  const endothelialScore = Math.max(35, Math.min(98, Math.round(100 - asi * 0.7)));

  // Cardiac Workload
  const rpp = Math.round((params.hr * params.systolic) / 100);
  const mvo2 = Number((rpp * 0.32).toFixed(1));
  const strokeVolume = Math.round(82 - (params.hr > 70 ? (params.hr - 70) * 0.4 : 0));
  const cardiacOutput = Number(((strokeVolume * params.hr) / 1000).toFixed(1));
  const lvStrain = rpp > 115 ? 'Elevated Strain' : rpp > 95 ? 'Moderate Demand' : rpp > 75 ? 'Mild Load' : 'Optimal';
  const tpr = Math.round((map / (cardiacOutput || 5)) * 80);
  const workloadCategory = rpp > 120 ? 'Excessive Strain' : rpp > 100 ? 'Elevated Myocardial Work' : rpp > 80 ? 'Mild Hemodynamic Demand' : 'Optimal Resting Load';

  // Extended HRV
  const sdnn = Math.round(params.hrv * 1.35);
  const pnn50 = Math.max(3, Math.min(48, Math.round(params.hrv * 0.45)));
  const lfHf = Number((0.6 + (params.stress / 45)).toFixed(2));
  const baevsky = Math.round(30 + (params.stress * 2.2));
  const vagalTone = Math.max(15, Math.min(98, Math.round(100 - params.stress * 0.85)));

  // BMI
  const estimatedBmi = Number((22.4 + (Math.random() * 1.8 - 0.9)).toFixed(1));
  const bmiCategory = estimatedBmi >= 30 ? 'Class 1 Obese' : estimatedBmi >= 25 ? 'Overweight' : estimatedBmi < 18.5 ? 'Underweight' : 'Normal / Healthy';
  const fwhr = Number((1.78 + (estimatedBmi > 25 ? 0.15 : 0)).toFixed(2));
  const facialAdiposity = Math.round(estimatedBmi * 2.8);

  // Breathing
  const rsaScore = Math.max(30, Math.min(96, Math.round(95 - params.stress * 0.6)));
  const ieRatio = params.respiration > 18 ? '1 : 1.2' : params.respiration > 15 ? '1 : 1.5' : '1 : 1.8';
  const breathingDepth = params.respiration > 17 ? 'Shallow Clavicular' : params.respiration > 14 ? 'Balanced' : 'Deep Diaphragmatic';

  // Risk Forecasting
  const ascvdRisk = Number((1.8 + (params.systolic > 120 ? (params.systolic - 120) * 0.08 : 0) + (params.stress * 0.04)).toFixed(1));
  const metSRisk = Number((3.5 + (params.glucose > 95 ? (params.glucose - 95) * 0.3 : 0) + (params.stress * 0.06)).toFixed(1));
  const t2dRisk = Number((2.4 + (params.glucose > 100 ? (params.glucose - 100) * 0.4 : 0)).toFixed(1));
  const htnRisk = Number((4.5 + (params.systolic > 120 ? (params.systolic - 120) * 0.35 : 0)).toFixed(1));
  const vascularAgeDelta = Math.round((params.systolic - 118) * 0.15 + (params.stress - 35) * 0.08);

  // Blood sugar details
  const estimatedHbA1c = Number((4.6 + (params.glucose / 100) * 0.85).toFixed(1));
  const tirEstimate = Math.max(60, Math.min(99, Math.round(100 - (params.glucose > 100 ? (params.glucose - 100) * 1.5 : 0) - (params.stress * 0.2))));
  const insulinResistRisk = params.glucose > 110 || params.stress > 65 ? 'Moderate Risk' : params.glucose > 98 ? 'Mild Watch' : 'Low / Sensitive';

  return {
    id: params.id,
    timestamp: params.timestamp,
    sourceMode: params.sourceMode,
    userNotes: params.userNotes,
    vitals: {
      heartRate: {
        value: params.hr,
        unit: 'BPM',
        status: hrStatus,
        normalRange: '60 - 100 BPM',
        confidence: 94 + Math.floor(Math.random() * 5),
        interpretation: params.hr <= 80 ? 'Normal resting cardiovascular range.' : 'Elevated cardiac rate.',
      },
      stress: {
        score: params.stress,
        level: stressCategory,
        sympatheticToneRatio: Number((params.stress / 100 * 0.6 + 0.25).toFixed(2)),
        tensionIndicators: params.stress > 60 ? ['Forehead muscle strain', 'Sympathetic micro-vascular constriction'] : ['Relaxed ocular tone', 'Stable facial micro-perfusion'],
        recoveryCapacity: params.stress > 65 ? 'Depleted' : (params.stress > 40 ? 'Adequate' : 'High'),
      },
      bloodSugarRisk: {
        estimatedFastingMgDl: params.glucose,
        estimatedPostprandialTrend: params.glucose > 120 ? 'Active postprandial glycemic surge' : 'Stable baseline metabolic curve',
        riskLevel: params.glucoseLevel,
        glycemicStabilityScore: Math.max(20, Math.min(98, Math.round(100 - (params.glucose - 85) * 1.2))),
        estimatedHbA1c: estimatedHbA1c,
        timeInRangeEstimate: tirEstimate,
        insulinResistanceRisk: insulinResistRisk,
        metabolicSigns: [
          'Micro-vascular capillary reflection telemetry',
          `Estimated glucose index: ${params.glucose} mg/dL`,
        ],
        dietaryGuidance: [
          'Maintain balanced dietary fiber and hydration.',
          'Optimize post-meal activity to regulate glucose tolerance.',
        ],
        fastingVsPostprandialContext: params.glucose > 115 ? 'Post-meal glycemic influx' : 'Fasting resting baseline',
      },
      respirationRate: {
        value: params.respiration,
        unit: 'breaths/min',
        status: params.respiration <= 18 ? 'optimal' : 'elevated',
        normalRange: '12 - 20 breaths/min',
        confidence: 93,
      },
      hrv: {
        rmssdMs: params.hrv,
        sdnnMs: sdnn,
        pnn50Percent: pnn50,
        lfHfRatio: lfHf,
        baevskyStressIndex: baevsky,
        parasympatheticVagalTone: vagalTone,
        status: params.hrv >= 50 ? 'optimal' : (params.hrv >= 35 ? 'moderate' : 'low_recovery'),
        interpretation: params.hrv >= 50 ? 'High autonomic resilience' : 'Moderate autonomic recovery',
      },
      spO2: {
        value: params.spO2,
        unit: '%',
        status: 'optimal',
        confidence: 96,
      },
      bloodPressureEstimate: {
        systolic: params.systolic,
        diastolic: params.diastolic,
        category: bpCategory,
      },
    },
    bloodPressure: {
      systolic: params.systolic,
      diastolic: params.diastolic,
      map: map,
      pulsePressure: pulsePressure,
      category: bpCategory,
      vascularStiffnessIndex: asi,
      pulseWaveVelocityEstimate: pwv,
      endothelialHealthScore: endothelialScore,
      normalRange: '90-120 / 60-80 mmHg',
      interpretation: bpCategory === 'Normal' ? 'Ideal normotensive hemodynamics.' : `Blood pressure indicates ${bpCategory.toLowerCase()}.`,
    },
    cardiacWorkload: {
      ratePressureProduct: rpp,
      mvo2Index: mvo2,
      cardiacOutputLMin: cardiacOutput,
      strokeVolumeMl: strokeVolume,
      leftVentricularStrain: lvStrain,
      totalPeripheralResistance: tpr,
      workloadCategory: workloadCategory,
      interpretation: `RPP is ${rpp} indicating ${workloadCategory.toLowerCase()}.`,
    },
    bmiAdiposity: {
      estimatedBmi: estimatedBmi,
      bmiCategory: bmiCategory,
      facialAdiposityScore: facialAdiposity,
      fwhrRatio: fwhr,
      visceralAdiposityRisk: estimatedBmi > 27 ? 'Elevated' : estimatedBmi > 24 ? 'Moderate' : 'Low',
      metabolicPhenotype: estimatedBmi < 25 ? 'Lean Eumetabolic' : 'Mild Hypermetabolic Adipose',
      interpretation: `Optical facial contour geometry indicates an estimated BMI of ${estimatedBmi} (${bmiCategory}).`,
    },
    breathingRate: {
      value: params.respiration,
      unit: 'breaths/min',
      status: params.respiration <= 16 ? 'optimal' : 'normal',
      rhythmRegularity: 92,
      ieRatio: ieRatio,
      breathingDepth: breathingDepth,
      rsaCouplingScore: rsaScore,
      hyperventilationWatch: params.respiration > 22,
      normalRange: '12 - 20 breaths/min',
      interpretation: `Cadence is ${params.respiration} breaths/min with ${breathingDepth.toLowerCase()} depth.`,
    },
    riskForecasting: {
      ascvd10YearRiskPercent: ascvdRisk,
      metabolicSyndrome5YearRiskPercent: metSRisk,
      type2Diabetes5YearRiskPercent: t2dRisk,
      hypertension5YearRiskPercent: htnRisk,
      biologicalVascularAgeDelta: vascularAgeDelta,
      overallCardioMetabolicGrade: ascvdRisk > 7.5 ? 'Moderate Watch' : ascvdRisk > 5 ? 'Low Risk' : 'Optimal',
      primaryRiskDrivers: [
        params.stress > 50 ? 'Elevated stress sympathetic tone' : 'Cardiovascular rhythm stability',
        params.systolic > 125 ? 'Pre-hypertensive vascular tension' : 'Healthy arterial compliance',
      ],
      modifiableMitigationPotential: 'Up to 38% risk reduction through zone-2 aerobic movement, low-sodium DASH diet, and diaphragmatic breathing.',
    },
    hypertensionMonitoring: {
      currentStage: bpCategory,
      stageSeverityIndex: Math.min(100, Math.round((params.systolic - 100) * 1.5)),
      arterialStiffnessIndex: asi,
      pulseWaveVelocityMs: pwv,
      baroreflexSensitivity: Number((16.5 - (params.stress * 0.1)).toFixed(1)),
      nocturnalNonDippingRisk: params.stress > 65 ? 'High' : params.stress > 40 ? 'Moderate' : 'Low',
      alertLevel: params.systolic >= 140 ? 'urgent' : params.systolic >= 130 ? 'attention' : params.systolic >= 120 ? 'watch' : 'optimal',
      dashDietComplianceGuidance: [
        'Target daily dietary potassium intake > 3500mg (spinach, avocado, bananas).',
        'Maintain sodium under 2000mg to alleviate capillary fluid tension.',
      ],
      clinicalProtocolAdvice: bpCategory === 'Normal' ? 'Maintain healthy lifestyle habits.' : 'Monitor blood pressure regularly with certified arm cuff.',
    },
    holisticScores: {
      vitalityIndex: Math.max(30, Math.round(100 - params.stress * 0.4 - (params.glucose > 110 ? 15 : 0))),
      autonomicBalance: Math.max(20, Math.round(100 - params.stress * 0.8)),
      fatigueDebtIndex: Math.min(95, Math.round(params.stress * 0.7 + (params.hr > 85 ? 15 : 0))),
      vascularPerfusionScore: Math.round(85 + (Math.random() * 12 - 6)),
    },
    facialBiomarkers: {
      skinPerfusionQuality: 'Micro-vascular capillary pulsation detected',
      microTremorScore: Math.round(params.stress * 0.3),
      blinkRatePerMin: 14 + Math.round(Math.random() * 6),
      periorbitalHydration: 'Adequate micro-circulation',
      facialMicroExpressionSymmetry: '97% bilateral symmetry',
    },
    clinicalNotes: {
      summary: `Longitudinal reading recorded at ${new Date(params.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Heart rate ${params.hr} BPM, BP ${params.systolic}/${params.diastolic} mmHg, stress index ${params.stress}/100, and glucose proxy ${params.glucose} mg/dL.`,
      keyObservations: [
        `Resting heart rate telemetry: ${params.hr} BPM`,
        `Estimated blood sugar proxy: ${params.glucose} mg/dL (${params.glucoseLevel})`,
        `HRV RMSSD resilience index: ${params.hrv}ms`,
      ],
      lifestyleActionPlan: {
        immediateBreathing: params.stress > 50 ? 'Engage in 4-7-8 breathing for parasympathetic activation.' : 'Maintain natural diaphragmatic cadence.',
        nutritionAndGlycemic: params.glucose > 115 ? 'Take a light 10-minute walk to enhance glucose clearance.' : 'Maintain whole-food low-glycemic nutrition.',
        hydration: 'Maintain cellular hydration with electrolyte water.',
        circadianSleep: 'Ensure 7-8 hours of continuous sleep.',
      },
      disclaimer: 'FaceVital AI optical wellness indicator. Not a laboratory blood test.',
    },
  };
}

/**
 * Loads stored history or seeds default longitudinal history.
 */
export function loadVitalHistory(): FaceScanResult[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load history from localStorage:', e);
  }

  // Initial seed with rich historical data so charts across days, weeks, months work immediately
  const initialHistory = generateRealisticHistoricalData(35);
  // Ensure the primary sample profile is the very latest
  initialHistory.unshift(SAMPLE_PROFILES[0].previewData);
  saveVitalHistory(initialHistory);
  return initialHistory;
}

/**
 * Saves vital scan history to localStorage.
 */
export function saveVitalHistory(history: FaceScanResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to persist history to localStorage:', e);
  }
}

/**
 * Exports history data to comprehensive CSV format for clinical or external analysis.
 */
export function exportHistoryCSV(history: FaceScanResult[]): void {
  if (!history || history.length === 0) {
    alert('No telemetry records available to export.');
    return;
  }

  const headers = [
    'Timestamp',
    'Date',
    'Time',
    'Source Mode',
    'Heart Rate (BPM)',
    'Heart Rate Status',
    'Stress Score (0-100)',
    'Stress Category',
    'Systolic BP (mmHg)',
    'Diastolic BP (mmHg)',
    'Blood Pressure Category',
    'Mean Arterial Pressure (MAP)',
    'Pulse Pressure (mmHg)',
    'Vascular Stiffness Index (ASI)',
    'Estimated Blood Glucose (mg/dL)',
    'Glycemic Risk Level',
    'Estimated HbA1c (%)',
    'Insulin Resistance Risk',
    'HRV RMSSD (ms)',
    'HRV SDNN (ms)',
    'LF/HF Ratio',
    'Vagal Tone Score',
    'Respiration Rate (BrPM)',
    'Breathing Depth',
    'RSA Coupling Score (%)',
    'Oxygen Saturation SpO2 (%)',
    'Rate Pressure Product (RPP)',
    'Cardiac Output (L/min)',
    'Stroke Volume (mL)',
    'Left Ventricular Strain',
    'Estimated BMI',
    'BMI Category',
    '10-Year ASCVD Risk (%)',
    '5-Year Type 2 Diabetes Risk (%)',
    'Biological Vascular Age Delta (Years)',
    'Vitality Index (0-100)',
    'Autonomic Balance (0-100)',
    'Fatigue Debt Index (0-100)',
    'User Notes / Clinical Context'
  ];

  const rows = history.map((scan) => {
    const d = new Date(scan.timestamp);
    const sbp = scan.bloodPressure?.systolic ?? scan.vitals?.bloodPressureEstimate?.systolic ?? '';
    const dbp = scan.bloodPressure?.diastolic ?? scan.vitals?.bloodPressureEstimate?.diastolic ?? '';
    const bpCat = scan.bloodPressure?.category ?? scan.vitals?.bloodPressureEstimate?.category ?? '';
    const mapVal = scan.bloodPressure?.map ?? (typeof sbp === 'number' && typeof dbp === 'number' ? Number((dbp + (sbp - dbp) / 3).toFixed(1)) : '');
    const ppVal = scan.bloodPressure?.pulsePressure ?? (typeof sbp === 'number' && typeof dbp === 'number' ? sbp - dbp : '');
    const asiVal = scan.bloodPressure?.vascularStiffnessIndex ?? '';

    return [
      `"${scan.timestamp}"`,
      `"${d.toLocaleDateString()}"`,
      `"${d.toLocaleTimeString()}"`,
      `"${scan.sourceMode}"`,
      scan.vitals?.heartRate?.value ?? '',
      `"${scan.vitals?.heartRate?.status ?? ''}"`,
      scan.vitals?.stress?.score ?? '',
      `"${scan.vitals?.stress?.level ?? ''}"`,
      sbp,
      dbp,
      `"${bpCat}"`,
      mapVal,
      ppVal,
      asiVal,
      scan.vitals?.bloodSugarRisk?.estimatedFastingMgDl ?? '',
      `"${scan.vitals?.bloodSugarRisk?.riskLevel ?? ''}"`,
      scan.vitals?.bloodSugarRisk?.estimatedHbA1c ?? '',
      `"${scan.vitals?.bloodSugarRisk?.insulinResistanceRisk ?? ''}"`,
      scan.vitals?.hrv?.rmssdMs ?? '',
      scan.vitals?.hrv?.sdnnMs ?? '',
      scan.vitals?.hrv?.lfHfRatio ?? '',
      scan.vitals?.hrv?.parasympatheticVagalTone ?? '',
      scan.vitals?.respirationRate?.value ?? scan.breathingRate?.value ?? '',
      `"${scan.breathingRate?.breathingDepth ?? ''}"`,
      scan.breathingRate?.rsaCouplingScore ?? '',
      scan.vitals?.spO2?.value ?? '',
      scan.cardiacWorkload?.ratePressureProduct ?? '',
      scan.cardiacWorkload?.cardiacOutputLMin ?? '',
      scan.cardiacWorkload?.strokeVolumeMl ?? '',
      `"${scan.cardiacWorkload?.leftVentricularStrain ?? ''}"`,
      scan.bmiAdiposity?.estimatedBmi ?? '',
      `"${scan.bmiAdiposity?.bmiCategory ?? ''}"`,
      scan.riskForecasting?.ascvd10YearRiskPercent ?? '',
      scan.riskForecasting?.type2Diabetes5YearRiskPercent ?? '',
      scan.riskForecasting?.biologicalVascularAgeDelta ?? '',
      scan.holisticScores?.vitalityIndex ?? '',
      scan.holisticScores?.autonomicBalance ?? '',
      scan.holisticScores?.fatigueDebtIndex ?? '',
      `"${(scan.userNotes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `facevital_vital_signs_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
