<?php
/**
 * Module Name: Search
 * Module Description: Help visitors quickly find answers with highly relevant instant search results and powerful filtering.
 * First Introduced: 5.0
 * Sort Order: 34
 * Free: false
 * Requires Connection: Yes
 * Auto Activate: No
 * Feature: Search
 * Additional Search Queries: search, elastic, elastic search, elasticsearch, fast search, search results, search performance, google search
 * Plans: business, complete
 *
 * @package automattic/jetpack
 */

require_once __DIR__ . '/search/class-jetpack-search-customberg.php';

new Automattic\Jetpack\Search\Jetpack_Initializer();
Automattic\Jetpack\Search\Jetpack_Search_Customberg::instance();
