import { Router } from "express";
import updateMetadata from "../utils/metadataUpdater";

/**
 * A route that would be invoked when an external data source changes.
 * This calls a common `updateMetadata` method that pushes static
 * data to Discord.
 */
const router = Router();

router.post<never, unknown, { userId: string; key: string }>(
    "/",
    async (req, res) => {
        if (req.body.key !== process.env.INTERNAL_SERVER_KEY) {
            return res.sendStatus(403);
        }

        try {
            await updateMetadata(req.body.userId);

            res.sendStatus(204);
        } catch {
            res.sendStatus(500);
        }
    }
);

export default router;
