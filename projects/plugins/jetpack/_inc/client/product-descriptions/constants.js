/**
 * Internal dependencies
 */
import { imagePath } from 'constants/urls';

export const PRODUCT_DESCRIPTION_PRODUCTS = {
	JETPACK_ANTI_SPAM: 'akismet',
	JETPACK_BACKUP_DAILY: 'backup',
	JETPACK_SCAN: 'scan',
	JETPACK_SEARCH: 'search',
	JETPACK_SECURITY: 'security',
};

export const productDescriptionRoutes = [
	`/product/${ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_ANTI_SPAM }`,
	`/product/${ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_BACKUP_DAILY }`,
	`/product/${ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_SCAN }`,
	`/product/${ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_SEARCH }`,
	`/product/${ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_SECURITY }`,
];

export const productIllustrations = {
	[ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_ANTI_SPAM ]: `${ imagePath }products/illustration-anti-spam.png`,
	[ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_BACKUP_DAILY ]: `${ imagePath }products/illustration-backup.png`,
	[ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_SCAN ]: `${ imagePath }products/illustration-scan.png`,
	[ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_SEARCH ]: `${ imagePath }products/illustration-search.png`,
	[ PRODUCT_DESCRIPTION_PRODUCTS.JETPACK_SECURITY ]: `${ imagePath }products/illustration-scan.png`,
};
