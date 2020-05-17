import * as express from "express";
import * as admin from "firebase-admin";
import * as api from "./api";
import {handleError} from "./error";
import {logger} from "./logger";
import * as test from "./test";

// Initialise the firebase app
admin.initializeApp();

// Default port to listen on
const PORT = Number(process.env.PORT) || 8080;

// Express HTTP application
export const app = express();

// Add the graphql handler for the '/api' route
app.use("/api", api.handler);

// Add the error handler
app.use(handleError);

// Start the app if not imported
//
// This is needed to prevent the server from actually starting when used
// in tests.
if (test.interactive()) {
    app.listen(PORT, () => {
        logger.log({
            level: "info",
            message: `App listening on port ${PORT}`,
        });
    });
}
