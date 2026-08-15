#!/bin/bash

set -e

echo "Starting Xvfb..."

Xvfb :99 \
    -screen 0 1280x720x24 \
    -ac \
    +extension GLX \
    +render \
    -noreset &

sleep 1


echo "Starting PulseAudio..."

pulseaudio \
    --start \
    --system=false \
    --exit-idle-time=-1

sleep 2


echo "Creating virtual audio sink..."

if ! pactl list short sinks | grep -q "virtual_sink"; then
    pactl load-module module-null-sink \
        sink_name=virtual_sink \
        sink_properties=device.description=VirtualSink
fi

pactl set-default-sink virtual_sink


echo "Audio configuration:"
pactl list short sinks


echo "Starting application..."

exec node dist/index.js