import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption, CaptionStyle } from '../types';
import { CaptionOverlay } from '../components/CaptionOverlay';

export interface VideoWithCaptionsProps {
  videoSrc: string;
  captions: Caption[];
  style: CaptionStyle;
}

export const VideoWithCaptions: React.FC<VideoWithCaptionsProps> = ({
  videoSrc,
  captions,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const currentTime = frame / fps;

  // Find current caption based on time
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {videoSrc && (
        <Video
          src={videoSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
      
      {currentCaption && (
        <CaptionOverlay caption={currentCaption} style={style} />
      )}
    </AbsoluteFill>
  );
};
