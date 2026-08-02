import { ReviewQueue } from "../components/assessment/ReviewQueue";
import "./ReviewQueuePage.css";

/**
 * Production host for the local review queue.
 *
 * Written responses are captured with `requiresReview`, and the runner tells
 * the learner they are "awaiting review". Until this route existed, that was
 * not true in production: `ReviewQueue` was reachable only from `dev/review`,
 * which is dead-code-eliminated from a production build, so a submitted
 * response stayed pending **forever** with nothing anywhere able to score it.
 *
 * What this is, stated plainly because the previous copy overstated it: a
 * single-device, unauthenticated, self-hosted scoring surface. Responses live
 * in this browser's local storage; nothing is transmitted, no instructor is
 * notified, and no service is watching. Someone — usually the learner, or a
 * teacher sitting at the same machine — has to open this page and score the
 * response for its state to change.
 *
 * That has a direct consequence for evidence claims, recorded here rather than
 * quietly ignored: because there is no reviewer identity and no authentication,
 * a pass recorded here **cannot certify independent mastery**. It is a local,
 * self-administered judgment. `mastery-standard.md` §6.3's honesty constraint
 * applies — the banner below says so to the learner, and the surrounding
 * evidence language must not claim more (see ADR-004).
 */
export function ReviewQueuePage() {
  return (
    <div className="review-queue-page">
      <p className="review-queue-page__scope" role="note">
        <strong>Local review, on this device only.</strong> Written responses
        are saved in this browser and are <strong>not sent anywhere</strong> —
        no instructor or service receives them. A response stays pending until
        someone opens this page and scores it here. Because there is no
        reviewer sign-in, a pass recorded here is a self-administered judgment,
        not independently certified mastery.
      </p>
      <ReviewQueue />
    </div>
  );
}
