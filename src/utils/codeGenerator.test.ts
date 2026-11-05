import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRemotionCode } from './codeGenerator';
import type { VideoBrief } from '../types/remotion';

const sampleBrief: VideoBrief = {
  id: 'test-1',
  topic: 'AI Launch 2026',
  format: '16:9',
  durationSeconds: 10,
  fps: 30,
  visualElements: {
    badgeText: 'NEW FEATURE',
    headline: 'Build Fast With AI',
    subheadline: 'Programmatic video generation with React',
    accentColor: '#6366f1',
    secondaryColor: '#06b6d4',
    backgroundColor: '#0a0a0f',
    featureList: ['Reactive UI', 'Remotion Hooks', 'Zod Props Validation'],
    metricNumber: '10x',
    metricLabel: 'Faster Video Rendering',
    ctaText: 'Start Building Today',
    brandName: 'Remotion Studio',
    animationStyle: 'spring-smooth',
    backgroundStyle: 'dark-cyber',
  },
  scenes: [
    {
      id: 'sc-1',
      templateType: 'hook-title',
      name: 'Intro Hook',
      durationInFrames: 90,
      title: 'Build Fast With AI',
      transitionNext: { type: 'slide-left', durationInFrames: 15 },
    },
    {
      id: 'sc-2',
      templateType: 'feature-grid',
      name: 'Feature Grid',
      durationInFrames: 120,
      transitionNext: { type: 'zoom-in', durationInFrames: 14 },
    },
    {
      id: 'sc-3',
      templateType: 'outro-cta',
      name: 'CTA',
      durationInFrames: 90,
    },
  ],
};

test('generateRemotionCode outputs all 4 required artifacts with multi-scene support', () => {
  const result = generateRemotionCode(sampleBrief);
  assert.ok(result.rootCode, 'Root code should exist');
  assert.ok(result.compositionCode, 'Composition code should exist');
  assert.ok(result.schemaCode, 'Schema code should exist');
  assert.ok(result.instructionsMd, 'Instructions should exist');
});

test('generated code complies with Remotion technical standards and dynamic scenes', () => {
  const result = generateRemotionCode(sampleBrief);

  // Hook checks
  assert.ok(result.compositionCode.includes('useCurrentFrame()'));
  assert.ok(result.compositionCode.includes('useVideoConfig()'));
  assert.ok(result.compositionCode.includes('spring('));
  assert.ok(result.compositionCode.includes('interpolate('));
  assert.ok(result.compositionCode.includes('<Sequence'));

  // Multi-scene schema checks
  assert.ok(result.schemaCode.includes("import { z } from 'zod';"));
  assert.ok(result.schemaCode.includes('export const sceneSchema = z.object('));
  assert.ok(result.schemaCode.includes('export const videoPropsSchema = z.object('));
  assert.ok(result.schemaCode.includes('scenes: z.array(sceneSchema)'));

  // Root checks
  assert.ok(result.rootCode.includes('<Composition'));
  assert.ok(result.rootCode.includes('fps={30}'));
  assert.ok(result.rootCode.includes('width={1920}'));
  assert.ok(result.rootCode.includes('height={1080}'));

  // Instructions check
  assert.ok(result.instructionsMd.includes('npm run dev'));
  assert.ok(result.instructionsMd.includes('npx remotion render'));
});

test('vertical 9:16 format generates 1080x1920 resolution', () => {
  const verticalBrief: VideoBrief = {
    ...sampleBrief,
    format: '9:16',
    durationSeconds: 15,
  };
  const result = generateRemotionCode(verticalBrief);

  assert.ok(result.rootCode.includes('width={1080}'));
  assert.ok(result.rootCode.includes('height={1920}'));
});
