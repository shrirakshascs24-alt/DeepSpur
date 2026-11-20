export interface GroupMetric {
  id: number;
  name: string;
  accuracy: number;
  sampleCount: number;
}

export interface ModelMetricsResponse {
  overallAccuracy: number;
  worstGroupAccuracy: number;
  groups: GroupMetric[];
}