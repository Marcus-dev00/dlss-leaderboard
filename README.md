# DLSS Leaderboard — Diamond Life Style Studio

> **Internal Team System**: This application is exclusively designed for internal headcount recording and performance leaderboards for the **DLSS (Diamond Life Style Studio)** team.

---

## 🌐 Quick Language Links / 语言导航 / Navigasi Bahasa
- [English](#-english-default)
- [中文 (Simplified Chinese)](#-中文-chinese)
- [Bahasa Melayu](#-bahasa-melayu)

---

## 🇬🇧 English (Default)

### 📌 Overview
A lightweight, fast, real-time headcount registration and scoring leaderboard system tailored for the DLSS internal team.

### ✨ Core Features & Methods
1. **Zero-Password Instant Entry**:
   - Team members simply enter their name (e.g. `Dylan`, `Marcus`) to enter.
   - Existing members are logged in immediately; new members have their profile created automatically without any registration hassle.
2. **Dual Submission Channels & Point Calculation**:
   - **Standard Channel**: `8 Points / pax`
   - **OPP Session Channel**: `10 Points / pax`
   - Real-time interactive point calculator with celebratory confetti animation upon submission.
3. **Multi-Period Live Leaderboard**:
   - Real-time WebSocket sync via Supabase Realtime (no page reload required).
   - Filter by **All-Time**, **Monthly**, and **Weekly** rankings.
   - Architectural Top 3 podium (Gold 🥇, Silver 🥈, Bronze 🥉).
4. **Floating Action Island**:
   - Mobile-first floating capsule docked at the bottom displaying personal rank, score, headcount, and quick `[ + Record ]` action.
5. **Submission History & Undo**:
   - Personal history log with one-click deletion for mistaken submissions.
6. **Tri-lingual Support (EN / 中 / BM)**:
   - Instant language switching across English (default), Chinese, and Malay.

### 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS (Warm Minimalist Theme), Lucide Icons, Canvas Confetti.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Realtime Broadcast).
- **Deployment**: GitHub Pages static deployment.

### 🚀 Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🇨🇳 中文 (Chinese)

### 📌 系统概述
专为 **DLSS (Diamond Life Style Studio)** 内部团队打造的轻量、极速、实时人数登记与战绩排行榜系统。

### ✨ 核心功能与实现方式
1. **纯姓名免密极速进入**：
   - 员工输入姓名（例如：`Dylan`、`Marcus`）即可一秒进入。
   - 已有员工直接载入数据，新员工首次输入自动完成静默建档，免去密码与注册烦恼。
2. **双渠道计分模式**：
   - **普通登记**：`8 分 / 人`
   - **OPP 专场**：`10 分 / 人`
   - 步进器实时计算积分，提交成功触发彩带撒花动画。
3. **多周期实时排行榜**：
   - 基于 Supabase Realtime 毫秒级数据广播，多端免刷新同步。
   - 支持 **总榜**、**月榜**、**周榜** 无缝切换。
   - 前三名尊享荣耀领奖台（冠军金 🥇、亚军银 🥈、季军铜 🥉）。
4. **底部灵动岛战绩栏**：
   - 移动端优先的居中悬浮胶囊，实时显示个人排名、积分、人数与快捷 `[ + 登记 ]`。
5. **历史流水与防误撤销**：
   - 随时查看个人登记明细，支持误填记录一键撤销删除。
6. **三语即时切换 (EN / 中 / BM)**：
   - 支持英文（默认）、中文、马来文无缝切换。

### 🛠️ 技术选型
- **前端**：React 18 + TypeScript + Vite + Vanilla CSS 极简暖色设计系统 + Lucide 图标 + Canvas Confetti
- **后端数据库**：Supabase (PostgreSQL + RLS 权限控制 + Realtime 实时流)
- **部署运维**：GitHub Pages 静态托管

---

## 🇲🇾 Bahasa Melayu

### 📌 Gambaran Keseluruhan
Sistem pendaftaran bilangan orang dan papan pendahulu mata secara langsung yang direka khas untuk pasukan dalaman **DLSS (Diamond Life Style Studio)**.

### ✨ Ciri-Ciri Utama & Kaedah
1. **Masuk Pantas Tanpa Kata Laluan**:
   - Pekerja hanya perlu memasukkan nama (cth. `Dylan`, `Marcus`) untuk mula.
   - Pekerja sedia ada akan log masuk secara automatik; pekerja baharu didaftarkan serta-merta tanpa borang pendaftaran rumit.
2. **Dua Saluran Pendaftaran & Pengiraan Mata**:
   - **Saluran Biasa**: `8 Mata / org`
   - **Sesi OPP**: `10 Mata / org`
   - Kalkulator mata automatik bersama animasi konfeti selepas penghantaran berjaya.
3. **Papan Pendahulu Masa Nyata**:
   - Penyegerakan langsung melalui Supabase Realtime tanpa perlu memuat semula halaman.
   - Pilihan paparan mengikut kedudukan **Semua (All-Time)**, **Bulanan**, dan **Mingguan**.
   - Pentas podium 3 teratas (Emas 🥇, Perak 🥈, Gangsa 🥉).
4. **Kapsul Terapung Bahagian Bawah**:
   - Kapsul terapung mesra telefon pintar yang memaparkan kedudukan, mata, bilangan orang, dan butang pantas `[ + Daftar ]`.
5. **Sejarah & Pembatalan Rekod**:
   - Semakan rekod penyerahan peribadi dengan fungsi padam untuk membetulkan kesilapan input.
   - Sokongan 3 bahasa segera: Bahasa Inggeris (lalai), Bahasa Cina, dan Bahasa Melayu.

### 🛠️ Pilihan Teknologi
- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS (Tema Warm Minimalist), Lucide Icons, Canvas Confetti.
- **Backend & Pangkalan Data**: Supabase (PostgreSQL, Row Level Security, Realtime).
- **Pengedaran**: GitHub Pages.

---

© 2026 **DLSS — Diamond Life Style Studio**. Internal Team Use Only.
