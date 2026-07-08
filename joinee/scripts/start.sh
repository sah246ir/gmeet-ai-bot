#!/bin/bash
set -e

# Start PulseAudio
pulseaudio --start

# Create virtual sink
pactl load-module module-null-sink \
    sink_name=meeting_sink \
    sink_properties=device.description=MeetingSink

# Verify
pactl list short sinks

# Start app
exec npm start