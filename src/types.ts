/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScanStatus = 
  | 'idle' 
  | 'preparing' 
  | 'scanning' 
  | 'analyzing' 
  | 'completed' 
  | 'error';

export interface RPPGSignalData {
  timestamps: number[];
  greenValues: number[];
  redValues: number[];
  blueValues: number[];
  filteredSignal: number[];
  instantBpm: number;
  signalQuality: number; // 0-100
}

export interface VitalMetric<T = number> {
  value: T;
  unit?: string;
  status: 'optimal' | 'normal' | 'moderate' | 'elevated' | 'high' | 'attention';
  normalRange?: string;
  confidence?: number;
  interpretation?: string;
}

export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  map: number; // Mean Arterial Pressure: DBP + (SBP - DBP)/3
  pulsePressure: number; // SBP - DBP
  category: 'Normal' | 'Elevated' | 'Stage 1 Hypertension' | 'Stage 2 Hypertension' | 'Hypertensive Crisis';
  vascularStiffnessIndex: number; // 0-100 (ASI)
  pulseWaveVelocityEstimate: number; // m/s
  endothelialHealthScore: number; // 0-100
  normalRange: string;
  interpretation: string;
}

export interface BloodSugarRiskData {
  estimatedFastingMgDl: number;
  estimatedPostprandialTrend: string;
  riskLevel: 'Optimal' | 'Normal' | 'Pre-diabetic Watch' | 'Elevated Glycemic Risk';
  glycemicStabilityScore: number; // 0 to 100
  estimatedHbA1c: number; // e.g. 5.4%
  timeInRangeEstimate: number; // e.g. 96%
  insulinResistanceRisk: 'Low / Sensitive' | 'Mild Watch' | 'Moderate Risk' | 'High Risk';
  metabolicSigns: string[];
  dietaryGuidance: string[];
  fastingVsPostprandialContext: string;
}

export interface CardiacWorkloadData {
  ratePressureProduct: number; // RPP = (HR * SBP) / 100
  mvo2Index: number; // Myocardial Oxygen Consumption Index
  cardiacOutputLMin: number; // L/min estimate
  strokeVolumeMl: number; // mL per beat
  leftVentricularStrain: 'Optimal' | 'Mild Load' | 'Moderate Demand' | 'Elevated Strain';
  totalPeripheralResistance: number; // dyn·s·cm⁻⁵ estimate
  workloadCategory: 'Optimal Resting Load' | 'Mild Hemodynamic Demand' | 'Elevated Myocardial Work' | 'Excessive Strain';
  interpretation: string;
}

export interface HRVExtendedData {
  rmssdMs: number;
  sdnnMs: number;
  pnn50Percent: number;
  lfHfRatio: number; // Sympathetic vs Parasympathetic balance
  baevskyStressIndex: number; // 0 - 250+
  parasympatheticVagalTone: number; // 0 - 100
  status: 'optimal' | 'moderate' | 'low_recovery';
  interpretation: string;
}

export interface BmiAdiposityData {
  estimatedBmi: number;
  bmiCategory: 'Underweight' | 'Normal / Healthy' | 'Overweight' | 'Class 1 Obese' | 'Class 2/3 Obese';
  facialAdiposityScore: number; // 0-100 optical index
  fwhrRatio: number; // Facial Width-to-Height Ratio (FWHR)
  visceralAdiposityRisk: 'Low' | 'Moderate' | 'Elevated';
  calibratedHeightCm?: number;
  calibratedWeightKg?: number;
  metabolicPhenotype: string;
  interpretation: string;
}

export interface BreathingData {
  value: number; // breaths per minute
  unit: string;
  status: 'optimal' | 'normal' | 'moderate' | 'elevated' | 'high' | 'attention';
  rhythmRegularity: number; // 0 - 100
  ieRatio: string; // Inhalation to Exhalation ratio e.g. "1 : 1.8"
  breathingDepth: 'Deep Diaphragmatic' | 'Balanced' | 'Shallow Clavicular';
  rsaCouplingScore: number; // Respiratory Sinus Arrhythmia coupling %
  hyperventilationWatch: boolean;
  normalRange: string;
  interpretation: string;
}

export interface RiskForecastingData {
  ascvd10YearRiskPercent: number; // Framingham / ASCVD 10-year risk
  metabolicSyndrome5YearRiskPercent: number;
  type2Diabetes5YearRiskPercent: number;
  hypertension5YearRiskPercent: number;
  biologicalVascularAgeDelta: number; // -5 to +10 years compared to chronological age
  overallCardioMetabolicGrade: 'Optimal' | 'Low Risk' | 'Moderate Watch' | 'Elevated Attention';
  primaryRiskDrivers: string[];
  modifiableMitigationPotential: string;
  simulatedAdjustments?: {
    bpReductionMmHg: number;
    stressReductionPercent: number;
    activeDaysPerWeek: number;
    sleepHoursNight: number;
    postSimulationAscvdRisk: number;
    postSimulationMetabolicRisk: number;
  };
}

export interface HypertensionMonitoringData {
  currentStage: 'Normal' | 'Elevated' | 'Stage 1 Hypertension' | 'Stage 2 Hypertension' | 'Hypertensive Crisis';
  stageSeverityIndex: number; // 0-100
  arterialStiffnessIndex: number; // 0-100
  pulseWaveVelocityMs: number; // m/s
  baroreflexSensitivity: number; // ms/mmHg
  nocturnalNonDippingRisk: 'Low' | 'Moderate' | 'High';
  alertLevel: 'optimal' | 'watch' | 'attention' | 'urgent';
  dashDietComplianceGuidance: string[];
  clinicalProtocolAdvice: string;
}

export interface StressData {
  score: number; // 0-100
  level: 'Low / Relaxed' | 'Moderate' | 'Elevated' | 'High Stress';
  sympatheticToneRatio: number; // e.g. 0.65
  tensionIndicators: string[];
  recoveryCapacity: 'High' | 'Adequate' | 'Depleted';
}

export interface FaceScanResult {
  id: string;
  timestamp: string;
  sourceMode: 'live_webcam' | 'sample_profile' | 'uploaded_image';
  userNotes?: string;
  
  vitals: {
    heartRate: VitalMetric<number>;
    stress: StressData;
    bloodSugarRisk: BloodSugarRiskData;
    respirationRate: VitalMetric<number>;
    hrv: HRVExtendedData;
    spO2: VitalMetric<number>;
    bloodPressureEstimate: {
      systolic: number;
      diastolic: number;
      category: string;
    };
  };

  // Comprehensive Clinical & Physiological Modules
  bloodPressure: BloodPressureData;
  cardiacWorkload: CardiacWorkloadData;
  bmiAdiposity: BmiAdiposityData;
  breathingRate: BreathingData;
  riskForecasting: RiskForecastingData;
  hypertensionMonitoring: HypertensionMonitoringData;

  holisticScores: {
    vitalityIndex: number; // 0-100
    autonomicBalance: number; // 0-100
    fatigueDebtIndex: number; // 0-100
    vascularPerfusionScore: number; // 0-100
  };

  facialBiomarkers: {
    skinPerfusionQuality: string;
    microTremorScore: number;
    blinkRatePerMin: number;
    periorbitalHydration: string;
    facialMicroExpressionSymmetry: string;
  };

  clinicalNotes: {
    summary: string;
    keyObservations: string[];
    lifestyleActionPlan: {
      immediateBreathing: string;
      nutritionAndGlycemic: string;
      hydration: string;
      circadianSleep: string;
    };
    disclaimer: string;
  };

  rawSnapshotDataUrl?: string;
  rppgSignalHistory?: number[];
}

export interface SampleProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  previewData: FaceScanResult;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
}

export type RecommendationCategory = 'hydration' | 'relaxation' | 'nutrition' | 'cardiovascular' | 'circadian' | 'hypertension' | 'metabolic';
export type RecommendationPriority = 'high' | 'medium' | 'routine';

export interface HealthRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  actionText: string;
  rationale: string;
  priority: RecommendationPriority;
  impactBadge: string;
  timeframe: string;
  actionType?: 'breathing' | 'hydration_log' | 'walk_timer' | 'diet_swap' | 'none';
  completed?: boolean;
}

export interface WeeklyHealthInsightsData {
  generatedAt: string;
  periodLabel: string;
  overallVitalityScore: number;
  vitalityTrajectory: 'improving' | 'stable' | 'declining';
  statusHeadline: string;
  naturalLanguageSummary: string;
  cardiovascularInsight: string;
  stressRecoveryInsight: string;
  glycemicMetabolicInsight: string;
  weeklyAverages: {
    heartRateAvg: number;
    heartRateDelta: number;
    stressAvg: number;
    stressDelta: number;
    glucoseAvg: number;
    glucoseDelta: number;
    scansCount: number;
  };
  keyWeeklyTakeaways: string[];
}

export interface RedactionOptions {
  redactFaceSnapshot: boolean;
  anonymizePatient: boolean;
  patientAlias: string;
  patientAgeGender: string;
  excludeUserNotes: boolean;
  includeCardiac: boolean;
  includeMetabolic: boolean;
  includeStressHrv: boolean;
  includeRiskForecast: boolean;
  includeLifestylePlan: boolean;
  expiresInHours: number | null; // e.g. 24, 72, 168, null = never
  pinCode?: string; // Optional 4-6 digit PIN
  customClinicianNote?: string;
}

export interface SharedReportPayload {
  v: number; // Schema version
  shareId: string;
  createdAt: string;
  expiresAt: string | null;
  hasPin: boolean;
  pinHash?: string;
  subjectLabel: string;
  demographics?: string;
  clinicianNote?: string;
  redactionsApplied: string[];
  scan: FaceScanResult;
}
