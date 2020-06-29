/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "*.graphql" {
  import { DocumentNode } from "graphql";
  export default typeof DocumentNode;
}
