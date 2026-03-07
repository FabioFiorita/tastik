export const MAX_LISTS_PER_USER = 50;
export const MAX_ITEMS_PER_LIST = 500;
export const MAX_TAGS_PER_LIST = 50;
export const MAX_EDITORS_PER_LIST = 10;

export const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_PROFILE_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
] as const;

export const PROFILE_IMAGE_ACCEPT = ALLOWED_PROFILE_IMAGE_TYPES.join(",");
