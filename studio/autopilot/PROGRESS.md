# PROGRESS
Updated: 2026-11-19 03:20 UTC (scheduled run)
YT uploads in rolling 24h: 5/5 (0zjKdLa3qQg, 2_N2dKh-SGU, 0kiWffItkg4, fF8fHqk3-vc, -OXGm_74tFM) -> quota FULL; next upload only when the oldest of these is >24h old (exact upload times not logged; log UTC time with every future upload).
Sheet: 3 rows (videos 1-3), no Status set yet -> nothing approved, nothing to publish.
PROBLEM v4: branch videos has v/v4.mp4 (pushed 02:41 UTC) about LAKE NYOS, CAMEROON - not Tamil history, no source/script on main. NOT uploaded, NOT in sheet. QA anyway: 75.5 s, 1080x1920, -14.2 LUFS, true peak -0.9 dBTP (fails <= -1). Needs user decision; treat as off-topic.
Current: v5 Kallanai / Grand Anicut - steps 2-4 done: studio/autopilot/v5/script.json (14 lines, 3 sources, hedges), IPA added (Kallanai, Karikala, Sangam, Anaikattu, Anicut, Kollidam). Note: wikipedia / dtnext / incredibleindia were blocked by this session's network, facts came from search snippets; re-check against sources in QA.
Next command: v5 step 5 - pick new art direction (log in compositions.md), install kokoro-onnx + models, voice_ph.py, shots_a/b/c swarm (engine from studio/v3-final/src, capture.mjs from studio/v2-gangaikonda/tools), mix.py, QA, push v/v5.mp4, upload when quota frees.
Missing: memory /areas/aazhi-channel.md was not reachable in this run; studio/autopilot/tools/capture.mjs does not exist (copies in ep1-rajaraja/tools, v2-gangaikonda/tools).

heartbeat: 2026-11-18T17:16:14Z
Scheduled task: hourly at :07 IST, lock via heartbeat line
Approval sheet: 'AAZHI Approvals' id 1PeKpfx2zq7oCEoTtotyLLU-J3krC_T18zjU26NiKrCU https://docs.google.com/spreadsheets/d/1PeKpfx2zq7oCEoTtotyLLU-J3krC_T18zjU26NiKrCU/edit (read Status/Instagram columns before upload/post; Google Sheets default connection set)
VOICE (user approved 2026-11-18): Kokoro voice af_heart, speed 0.9, phoneme mode. Narration is built as IPA: English text via tokenizer.phonemize, Tamil names via data/pronunciations.json (kokoro_onnx create(..., is_phonemes=True), words never split, single pass). Add every new Tamil name to the list. Channel name spoken "Aali". Captions keep English spelling. Install: pip install kokoro-onnx; models in ~/.faceless-shorts/kokoro (GitHub release files).
heartbeat: 2026-11-18T18:29:05Z
heartbeat: 2026-11-18T18:30:32Z
heartbeat: 2026-11-18T18:31:54Z
heartbeat: 2026-11-19T01:57:19Z
heartbeat: 2026-11-19T03:07:36Z
heartbeat: 2026-11-19T03:09:48Z
