"""Render the SLM experiment's applyRoboticEffect as a static WAV.

Requires ffmpeg. Run from any directory with Python 3.
Matches firebase-test.html: gain = 0.15 + sin(2*pi*110*t), plus
uniform noise scaled by 0.02 and then 0.01. No normalization is applied.
"""

from array import array
from pathlib import Path
import math
import random
import subprocess
import sys
import wave

assets = Path(__file__).resolve().parents[1] / "assets/projects/voice-quality"
source = assets / "career-estimation-natural.mp3"
target = assets / "career-estimation-robotic.wav"
sample_rate = 48000
decoded = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(source), "-ar", str(sample_rate),
     "-ac", "1", "-f", "f32le", "-"],
    check=True, capture_output=True,
).stdout
samples = array("f")
samples.frombytes(decoded)
if sys.byteorder != "little":
    samples.byteswap()

# A fixed seed makes this render repeatable; the experiment used Math.random().
noise = random.Random(110)
pcm = array("h")
for i, sample in enumerate(samples):
    gain = 0.15 + math.sin(2 * math.pi * 110 * i / sample_rate)
    value = sample * gain + (noise.random() - 0.5) * 0.02 * 0.01
    pcm.append(int(max(-1, min(1, value)) * 32767))
if sys.byteorder != "little":
    pcm.byteswap()
with wave.open(str(target), "wb") as output:
    output.setparams((1, 2, sample_rate, 0, "NONE", "not compressed"))
    output.writeframes(pcm.tobytes())
print(f"Rendered {len(samples) / sample_rate:.2f}s to {target.name}")
