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

export interface TestSubgroupStat {
  id: number;
  name: string;
  shortName: string;
  label: number;
  context: number;
  count: number;
  percentage: number;
}

export interface DatasetStatsResponse {
  datasetName: string;
  totalCorpus: number;
  splits: {
    train: number;
    validation: number;
    test: number;
  };
  testSubgroups: TestSubgroupStat[];
}