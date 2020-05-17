// Logger configuration
import * as winston from "winston";

// Set up logging
export const logger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.Console(),
    ],
});
