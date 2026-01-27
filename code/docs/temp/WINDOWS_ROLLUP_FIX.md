# Windows Rollup 依赖问题修复

## 问题描述

运行 `yarn electron:build:win:skip-check` 时出现错误：
```
Error: Your application tried to access rollup, but it isn't declared in your dependencies
```

这是 Yarn PnP 的特性：所有依赖必须显式声明，即使是传递依赖。

## ✅ 已修复

已将 `rollup` 添加到 `devDependencies` 中：
```json
{
  "devDependencies": {
    "rollup": "^4.53.3",
    ...
  }
}
```

## 🔧 解决步骤

### 步骤 1：安装 rollup 依赖

在 Windows CMD 中运行：

```cmd
cd C:\code\dreambook

# 添加 rollup 依赖
yarn add -D rollup

# 或者手动编辑 package.json 后运行
yarn install
```

### 步骤 2：重新构建

```cmd
yarn electron:build:win:skip-check
```

## 📝 为什么需要显式声明？

Yarn PnP（Plug'n'Play）要求：
- 所有直接使用的包必须显式声明
- 即使是通过其他包传递的依赖，如果被直接使用也需要声明
- Vite 使用 rollup 进行构建，所以需要显式声明

## ✅ 快速解决方案

**已自动添加 rollup 到 package.json**，您只需要：

```cmd
cd C:\code\dreambook

# 安装新依赖
yarn install

# 构建
yarn electron:build:win:skip-check
```

## 🔍 如果还有其他依赖问题

如果出现类似错误（某个包未声明），可以使用：

```cmd
# 添加缺失的依赖
yarn add -D <package-name>
```

常见可能需要添加的依赖：
- `rollup` ✅ 已添加
- 其他构建工具依赖（通常会自动解决）

