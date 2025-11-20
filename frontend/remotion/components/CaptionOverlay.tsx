import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption, CaptionStyle } from '@/lib/constants';

export interface CaptionOverlayProps {
  caption: Caption;
  style: CaptionStyle;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation for caption entrance
  const animation = spring({
    frame: frame - Math.floor(caption.start * fps),
    fps,
    config: {
      damping: 100,
    },
  });

  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '16px 32px',
      borderRadius: '8px',
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      fontSize: '48px',
      fontWeight: 700,
      textAlign: 'center',
      maxWidth: '90%',
      lineHeight: 1.4,
      opacity: animation,
    };

    switch (style) {
      case 'top':
        return {
          ...baseStyle,
          top: '80px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
        };
      
      case 'karaoke':
        return {
          ...baseStyle,
          bottom: '120px',
          background: 'linear-gradient(90deg, #ff6b6b 0%, #feca57 100%)',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          transform: `translateX(-50%) scale(${0.95 + animation * 0.05})`,
        };
      
      default: // bottom
        return {
          ...baseStyle,
          bottom: '120px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
        };
    }
  };

  return (
    <AbsoluteFill>
      <div style={getPositionStyle()}>
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};
