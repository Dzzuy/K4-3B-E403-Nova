"""
Config module for Track D1 Classroom Simulation Agent.
"""

import os

# Default LLM settings
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
TEMPERATURE = float(os.environ.get("GEMINI_TEMP", "0.4"))

# Paths to data
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "vlearn-pack")
TRANSCRIPT_DIR = os.path.join(DATA_DIR, "transcript")

# Default topic file
DEFAULT_TRANSCRIPT = "transcript-06-clean.md"
