export type SolarPanelData = {
  type: "solar-panel";
};

export type ExtractorData = {
  type: "extractor";
};

export type StorageData = {
  type: "storage";
};

export type ToolData = SolarPanelData | ExtractorData | StorageData;
