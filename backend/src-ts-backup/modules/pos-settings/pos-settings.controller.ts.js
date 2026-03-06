import * as settingsService from "./pos-settings.service.js";

export const getSettings = async (req, res) => {
  try {
    const data = await settingsService.getSettings();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const data = await settingsService.updateSettings(req.body);
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
