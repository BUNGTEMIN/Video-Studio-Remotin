import test from 'node:test';
import assert from 'node:assert/strict';
import {
  secondsToFrames,
  framesToSeconds,
  getResolutionForFormat,
  calculateSequenceBlocks,
  calculateSceneBlocks,
  getTotalFrames,
  sampleSpringCurve,
  getRenderPhase,
  estimateVideoFileSize,
} from './remotionMath';
import type { VideoScene } from '../types/remotion';

test('secondsToFrames calculates accurate frame counts at standard fps', () => {
  assert.equal(secondsToFrames(5, 30), 150);
  assert.equal(secondsToFrames(10, 30), 300);
  assert.equal(secondsToFrames(15, 60), 900);
  assert.equal(secondsToFrames(0, 30), 30); // fallback minimum
});

test('framesToSeconds formats frame timing accurately', () => {
  assert.equal(framesToSeconds(150, 30), '5.0');
  assert.equal(framesToSeconds(90, 30), '3.0');
  assert.equal(framesToSeconds(45, 30), '1.5');
});

test('getResolutionForFormat yields canonical 16:9 and 9:16 resolutions', () => {
  const horizontal = getResolutionForFormat('16:9');
  assert.equal(horizontal.width, 1920);
  assert.equal(horizontal.height, 1080);

  const vertical = getResolutionForFormat('9:16');
  assert.equal(vertical.width, 1080);
  assert.equal(vertical.height, 1920);
});

test('calculateSequenceBlocks accounts for all frames without gaps or overlaps', () => {
  const totalFrames = 300;
  const blocks = calculateSequenceBlocks(totalFrames);

  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].startFrame, 0);

  // Check continuity
  for (let i = 0; i < blocks.length - 1; i++) {
    assert.equal(blocks[i].startFrame + blocks[i].durationInFrames, blocks[i + 1].startFrame);
  }

  // Check sum of durations equals totalFrames
  const sumDuration = blocks.reduce((acc, b) => acc + b.durationInFrames, 0);
  assert.equal(sumDuration, totalFrames);
});

test('calculateSceneBlocks correctly maps custom multi-scenes and transitions', () => {
  const customScenes: VideoScene[] = [
    {
      id: 'sc-1',
      templateType: 'hook-title',
      name: 'Intro Hook',
      durationInFrames: 90,
      transitionNext: { type: 'slide-left', durationInFrames: 15 },
    },
    {
      id: 'sc-2',
      templateType: 'metric-impact',
      name: 'Big Metric',
      durationInFrames: 60,
      transitionNext: { type: 'zoom-in', durationInFrames: 12 },
    },
    {
      id: 'sc-3',
      templateType: 'outro-cta',
      name: 'Call to Action',
      durationInFrames: 90,
    },
  ];

  const blocks = calculateSceneBlocks(customScenes);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].startFrame, 0);
  assert.equal(blocks[0].durationInFrames, 90);
  assert.equal(blocks[1].startFrame, 90);
  assert.equal(blocks[1].durationInFrames, 60);
  assert.equal(blocks[2].startFrame, 150);
  assert.equal(blocks[2].durationInFrames, 90);

  const total = getTotalFrames(customScenes, 10, 30);
  assert.equal(total, 240);
});

test('sampleSpringCurve generates valid bounded easing progression', () => {
  const curve = sampleSpringCurve(20);
  assert.equal(curve.length, 21);
  assert.equal(curve[0], 0);
  assert.ok(curve[curve.length - 1] > 0.95 && curve[curve.length - 1] < 1.05);
});

test('getRenderPhase yields correct stage titles across progress bounds', () => {
  assert.equal(getRenderPhase(10).phase, 'init');
  assert.equal(getRenderPhase(45).phase, 'stitching');
  assert.equal(getRenderPhase(75).phase, 'encoding');
  assert.equal(getRenderPhase(96).phase, 'muxing');
  assert.equal(getRenderPhase(100).phase, 'completed');
});

test('estimateVideoFileSize outputs formatted size in MB', () => {
  const size169 = estimateVideoFileSize(10, '16:9');
  assert.equal(size169, '5.6 MB');
  const size916 = estimateVideoFileSize(10, '9:16');
  assert.equal(size916, '4.8 MB');
});
