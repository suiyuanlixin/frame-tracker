# Frame Tracker

Frame Tracker 是一个 Android 性能分析数据可视化工具，以 KernelSU / Magisk 模块的形式提供。

它提供了一个优雅的 WebUI 界面，用于解析和展示性能记录文件，帮助用户分析游戏或应用的帧率、功耗和温度表现。

## 功能特性

- **可视化报表**: 将枯燥的 CSV 数据转换为直观的图表和卡片。
- **WebUI 集成**: 深度集成 KernelSU WebUI，无需安装额外 APP，通过模块页面直接访问。

## 使用说明

1. **准备数据**: 使用 Scene 或其他工具录制性能数据。
2. **存放文件**: 将 CSV 文件移动到 `/data/adb/frame_tracker/csv/`。
3. **文件命名**: 必须格式为 `应用包名 年-月-日 时-分-秒.csv`。

## 注意事项

- 本模块**仅提供 WebUI**，不包含录制功能。
- **更新**模块时数据保留，**卸载**模块时数据会被**完全删除**，请注意备份。

## 关于作者

- **开发者**: Skyi Lici
- **GitHub**: [suiyuanlixin](https://github.com/suiyuanlixin)
- **酷安**: [Skyi Lici](https://www.coolapk.com/u/25572320)
- **QQ群组**: [Skyi Lici 模块发布](https://qm.qq.com/q/KyGVvIijK0)

- **开发者**: ShenEternity
