# 接口更新记录

| 序号 | 日期 | 接口/模块 | 变更内容 | 备注 |
| --- | --- | --- | --- | --- |
| 1 | 2025-11-26 | 预留 | 新增记录表，用于后续拆分成果/项目后的 API 变更说明。 | - |
| 2 | 2025-11-26 | `/open/papers` | 新增公开论文查询接口：`GET /open/papers`（分页列表，默认仅返回已发布论文）与 `GET /open/papers/{id}`（公开详情）。返回体采用 `LabPaperDTO`。 | 新增 |
| 3 | 2025-11-26 | `/lab/papers` | 新增后台论文接口：`GET /lab/papers`、`GET /lab/papers/{id}`、`POST /lab/papers`、`PUT /lab/papers/{id}`，以及 `GET/PUT /lab/papers/{id}/funds`；依赖 `LabPaperQuery`、`Create/UpdatePaperCommand` 和 `LabPaperDTO`。 | 新增 |
| 4 | 2025-11-26 | `/open/projects` | 新增公开项目接口：`GET /open/projects`（列表）与 `GET /open/projects/{id}`（详情，仅返回已发布项目）。 | 新增 |
| 5 | 2025-11-26 | `/lab/projects` | 新增后台项目接口：`GET/POST/PUT/DELETE /lab/projects` 及 `PUT /lab/projects/{id}/publish|verify`，依赖 `LabProjectQuery`、`Create/UpdateProjectCommand`、`LabProjectDTO`。 | 新增 |
| 6 | 2025-11-26 | 用户 & 成果接口文档 | 新增 `docs/实验室用户及成果管理接口汇总.md`，集中整理 `/lab/users/**`、`/lab/achievements/**`、`/open/achievements`、`/lab/dicts` 等全部字段、命令、DTO；供前端/测试统一参考。 | 文档 |
| 7 | 2025-11-26 | 数据结构补充 | `docs/实验室用户及成果管理接口汇总.md` 中新增 `LabUserProfileDTO`、`CreateLabUserCommand`、`LabAchievementDTO`、`PublicAchievementDTO` 等结构说明并同步到本更新记录，确保新增/更新的字段信息与接口文档一致。 | 文档 |

> 未来每次新增、调整或废弃接口时，请在此表补充记录，方便与前端联调。
