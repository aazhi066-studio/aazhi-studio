# PROGRESS
Updated: 2026-11-19 03:20 UTC (scheduled run)
YT uploads in rolling 24h: 5/5 (v1,v2,v3,v2b,v3b 07:35-07:58 IST 19 Nov) (0zjKdLa3qQg, 2_N2dKh-SGU, 0kiWffItkg4, fF8fHqk3-vc, -OXGm_74tFM) -> quota FULL; next upload only when the oldest of these is >24h old (exact upload times not logged; log UTC time with every future upload).
Sheet: 3 rows (videos 1-3), no Status set yet -> nothing approved, nothing to publish.
v4 Lake Nyos = off-genre exception set up by another session (project in studio/v4-final), rendered, NOT uploaded, waiting for quota (frees ~08:00 IST 2026-11-20, uploads were 07:35-07:58 IST 2026-11-19). Upload order when free: v4 first, then v5. My QA recheck of v/v4.mp4: 75.5 s, 1080x1920, -14.2 LUFS, true peak was -0.9 dBTP -> FIXED 03:30 UTC (limiter, video stream copied): -14.8 LUFS, -1.5 dBTP, pushed to videos v/v4.mp4 (QA pass).
v6 (04:30 UTC 19 Nov run): Buckingham Canal / 1876-78 famine relief canal, studio/v6-final, script+narration 77.4 s done, shots being drawn by 3 workers (ART.md 'Shadow Play on Parched Earth'), music gen:dust seed 62813. Network: wikipedia/madrasmusings blocked for fetch; facts checked via web search snippets.
Prev: v5 Kallanai DONE + QA PASS (03:30 UTC 19 Nov): 72.8 s, 1080x1920 30fps, -14.3 LUFS, -1.1 dBTP, captions synced (estimated word timing), frames checked, facts match script sources (hedged). Pushed videos v/v5.mp4 (62 MB). Project studio/v5-final, description studio/v5-final/desc.txt, music gen:frost seed 51907 (window-similarity check not run: no tool in repo).
UPLOAD QUEUE (quota frees ~08:00 IST 20 Nov = 02:30 UTC): 1) v4 Lake Nyos (needs its desc written from studio/v4-final/script.json), 2) v5 Kallanai (title in script.json, desc.txt). After each: sheet row + WhatsApp + log UTC time here.
Next command: start v6 (PLAN item 5 or a darker angle: famines / lost ports / forgotten battles), new art direction, steps 2-5; upload queue when quota frees.
Missing: memory /areas/aazhi-channel.md not reachable from the 03:07 UTC run.

Scheduled task: hourly at :07 IST, lock via heartbeat line
Approval sheet: 'AAZHI Approvals' id 1PeKpfx2zq7oCEoTtotyLLU-J3krC_T18zjU26NiKrCU https://docs.google.com/spreadsheets/d/1PeKpfx2zq7oCEoTtotyLLU-J3krC_T18zjU26NiKrCU/edit (read Status/Instagram columns before upload/post; Google Sheets default connection set)
VOICE (user approved 2026-11-18): Kokoro voice af_heart, speed 0.9, phoneme mode. Narration is built as IPA: English text via tokenizer.phonemize, Tamil names via data/pronunciations.json (kokoro_onnx create(..., is_phonemes=True), words never split, single pass). Add every new Tamil name to the list. Channel name spoken "Aali". Captions keep English spelling. Install: pip install kokoro-onnx; models in ~/.faceless-shorts/kokoro (GitHub release files).
heartbeat: 2026-11-19T05:31:40Z
