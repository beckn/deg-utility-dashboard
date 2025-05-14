import createClient from "openapi-react-query";
import { strapiClient } from "./strapi";

export const api = createClient(strapiClient);
