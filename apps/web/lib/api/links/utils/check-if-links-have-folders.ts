import { ProcessedLinkProps } from "../../../types";

export const checkIfLinksHaveFolders = (
  links: { folderId?: string | null }[],
) => links.some((link) => link.folderId);
