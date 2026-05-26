import { Redis } from "ioredis";
import { config } from "../config";

const redisPub = new Redis(config.redisUri);

export const publishEvent = (channel: string, data: object) => {
  redisPub.publish(channel, JSON.stringify(data));
};
