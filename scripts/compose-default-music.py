#!/usr/bin/env python3
"""Composes the default background music bed (assets/music/default-bed.mp3).

Every video gets a music bed even without a music provider: the only one wired up
(Gemini Lyria) needs a paid model, and its fallback returned a placeholder URL, so
renders came out with narration over silence. The track is synthesised here rather
than downloaded so its licence is never in question.

It is a quiet lo-fi loop meant to sit under narration: 92 BPM, Am7-Fmaj7-Cmaj7-G6,
warm pad, soft electric-piano arpeggio, sub bass and a light swung beat. Two passes
are rendered and the second kept, so the reverb tail wraps and the loop is seamless.

Usage: python3 scripts/compose-default-music.py   (needs numpy, scipy and ffmpeg)
"""
import os
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 92
BEAT = 60 / BPM
BARS_PER_CHORD = 2
CHORDS = [  # MIDI notes: voicing for the pad / keys, root for the bass
    ([57, 60, 64, 67], 45),  # Am7
    ([53, 57, 60, 64], 41),  # Fmaj7
    ([48, 52, 55, 59], 36),  # Cmaj7
    ([55, 59, 62, 64], 43),  # G6
]
CYCLES = 3  # 3 x 8 bars ~ 62.6 s per loop
rng = np.random.default_rng(7)

LOOP_BEATS = len(CHORDS) * BARS_PER_CHORD * 4 * CYCLES
LOOP = int(round(LOOP_BEATS * BEAT * SR))


def hz(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def lowpass(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "low", fs=SR, output="sos"), x)


def highpass(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "high", fs=SR, output="sos"), x)


def envelope(n, attack, release):
    env = np.ones(n)
    a, r = min(n, int(attack * SR)), min(n, int(release * SR))
    env[:a] = np.linspace(0, 1, a)
    if r:
        env[-r:] *= np.linspace(1, 0, r)
    return env


def saw(freq, n, harmonics=10):
    t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, harmonics + 1))


def add(buf, start, sig):
    start = int(start)
    end = min(len(buf), start + len(sig))
    if start < len(buf):
        buf[start:end] += sig[: end - start]


def compose(total_beats):
    n = int(round(total_beats * BEAT * SR)) + SR * 4
    pad, keys, bass, drums = (np.zeros(n) for _ in range(4))
    chord_len = BARS_PER_CHORD * 4 * BEAT
    for i in range(int(total_beats / (BARS_PER_CHORD * 4))):
        notes, root = CHORDS[i % len(CHORDS)]
        start = i * chord_len * SR
        # Pad: detuned band-limited saws, overlapping the next chord slightly.
        length = int((chord_len + 0.6) * SR)
        chord = sum(saw(hz(note) * d, length) for note in notes for d in (0.997, 1.0, 1.003))
        add(pad, start, chord * envelope(length, 0.8, 0.9))
        # Keys: eighth-note arpeggio, sine + soft overtone, gentle decay, humanised.
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for step in range(BARS_PER_CHORD * 8):
            note = notes[pattern[step % 8]] + 12
            onset = start + (step * BEAT / 2 + (0.035 if step % 2 else 0)) * SR
            dur = int(0.9 * SR)
            t = np.arange(dur) / SR
            tone = np.sin(2 * np.pi * hz(note) * t) + 0.25 * np.sin(4 * np.pi * hz(note) * t)
            vel = 0.55 + 0.25 * rng.random()
            add(keys, onset, vel * tone * np.exp(-t * 4.5) * envelope(dur, 0.004, 0.2))
        # Bass: root on beats 1 and 3, a pickup on the "and" of 4.
        for bar in range(BARS_PER_CHORD):
            for beat, length_beats in ((0, 1.6), (2, 1.2), (3.5, 0.45)):
                onset = start + (bar * 4 + beat) * BEAT * SR
                dur = int(length_beats * BEAT * SR)
                t = np.arange(dur) / SR
                add(bass, onset, np.sin(2 * np.pi * hz(root) * t) * envelope(dur, 0.01, 0.15))
    # Drums: soft kick on 1 and 3, rim on 2 and 4, swung closed hats.
    for b in range(int(total_beats)):
        onset = b * BEAT * SR
        if b % 2 == 0:
            dur = int(0.28 * SR)
            t = np.arange(dur) / SR
            sweep = 45 + 75 * np.exp(-t * 30)
            add(drums, onset, 0.9 * np.sin(2 * np.pi * np.cumsum(sweep) / SR) * np.exp(-t * 14))
        else:
            dur = int(0.12 * SR)
            noise = highpass(rng.standard_normal(dur), 1800) * np.exp(-np.arange(dur) / SR * 38)
            add(drums, onset, 0.22 * noise)
        for half in (0, 1):
            dur = int(0.035 * SR)
            hat = highpass(rng.standard_normal(dur), 7000) * np.exp(-np.arange(dur) / SR * 120)
            add(drums, onset + (half * 0.5 + (0.06 if half else 0)) * BEAT * SR, (0.07 + 0.03 * half) * hat)

    pad = lowpass(pad, 1100) * 0.05
    keys = lowpass(keys, 3200) * 0.16
    bass = lowpass(bass, 180) * 0.35
    drums = lowpass(drums, 9000) * 0.5
    return pad, keys, bass, drums


def reverb(x, seconds=2.2, mix=0.22):
    m = int(seconds * SR)
    ir = rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 3.2)
    wet = fftconvolve(x, lowpass(ir, 5000))[: len(x)]
    return x + mix * wet / np.max(np.abs(wet)) * np.max(np.abs(x))


def main():
    pad, keys, bass, drums = compose(LOOP_BEATS * 2)
    # Light stereo spread: keys and pad offset a few ms between channels.
    left = reverb(pad + keys) + bass + drums
    shift = int(0.012 * SR)
    right = reverb(np.roll(pad, shift) + np.roll(keys, -shift)) + bass + drums
    stereo = np.stack([left, right], axis=1)[LOOP : 2 * LOOP]  # second pass: tails wrap around
    stereo /= np.max(np.abs(stereo)) * 1.12

    out = os.path.join(os.path.dirname(__file__), "..", "assets", "music", "default-bed.mp3")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        wavfile.write(wav.name, SR, (stereo * 32767).astype(np.int16))
        # -18 LUFS keeps musicVolume meaningful: 0.2 sits well under narration.
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav.name, "-af", "loudnorm=I=-18:TP=-2:LRA=7",
                        "-ar", "44100", "-b:a", "128k", out], check=True)
    print(f"wrote {os.path.normpath(out)} ({LOOP / SR:.1f}s loop)")


if __name__ == "__main__":
    main()
