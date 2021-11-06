import { GraphQLClient } from "graphql-request";
import { getSdk } from "../__generated__/client";

const client = new GraphQLClient("/api/graphql");

export const dwClient = getSdk(client);
