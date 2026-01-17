import { Devvit } from '@devvit/public-api';

/**
 * Devvit entrypoint.
 *
 * IMPORTANT:
 * - Web apps still need a Devvit main module (this file) so the app can install.
 * - The web client is served from /public (configured in devvit.json).
 * - The web server is built to /dist/server (configured in devvit.json).
 */

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a Redartulous post',
  onPress: async (_event, ctx) => {
    const { reddit, ui, subredditName } = ctx;
    if (!subredditName) {
      ui.showToast('Open a subreddit first, then try again.');
      return;
    }

    try {
      // NOTE: SDK typings for submitCustomPost have changed across versions.
      // We keep the payload minimal and cast to any to stay compatible.
      await (reddit as any).submitCustomPost({
        subredditName,
        title: 'Redartulous',
        entry: 'default',
      });

      ui.showToast('Posted! Refresh the subreddit feed.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      ui.showToast(`Failed to create post: ${msg}`);
    }
  },
});

Devvit.addCustomPostType({
  name: 'Redartulous Game',
  render: (context) => {
    return (
      <vstack height="100%" width="100%" alignment="middle center" gap="medium">
        <text size="large" weight="bold">
          Redartulous
        </text>
        <text size="small">Tap below to launch the darts game inline.</text>
        <button
          onPress={() => {
            context.ui.showWebView({ key: 'default', url: 'index.html' });
          }}
        >
          Play Darts
        </button>
      </vstack>
    );
  },
});

export default Devvit;
