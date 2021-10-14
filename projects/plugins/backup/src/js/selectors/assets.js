const assetsSelectors = {
	getAssetBuildUrl: state => state.assets.buildUrl || null,
	getConnectedPlugins: state => state.assets.connectedPlugins || [],
};

export default assetsSelectors;
