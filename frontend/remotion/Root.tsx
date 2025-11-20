import { Composition } from 'remotion';
import { VideoWithCaptions } from './compositions/VideoWithCaptions';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoWithCaptions"
        component={VideoWithCaptions}
        durationInFrames={3000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: '',
          captions: [],
          style: 'bottom' as const,
        }}
      />
    </>
  );
};
